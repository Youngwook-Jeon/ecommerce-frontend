"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type DragEvent,
} from "react";
import { useDropzone, type FileRejection } from "react-dropzone";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  forEachConcurrent,
  mapConcurrent,
  putFileToPresignedUrl,
  resizeImageIfNeeded,
  toSafeUploadFileName,
  validateImageFile,
} from "@/lib/productImageUpload";
import {
  commitOptionValueImage,
  commitProductImage,
  deleteOptionValueImage,
  deleteProductImage,
  reorderOptionValueImages,
  reorderProductImages,
  requestOptionValueImageUploadUrl,
  requestProductImageUploadUrl,
} from "@/services/productService";
import type { ReadProductImageVm } from "@/types/productImage";
import { GripVertical, ImagePlus, Upload } from "lucide-react";

const DROP_ACCEPT = {
  "image/jpeg": [],
  "image/png": [],
  "image/webp": [],
  "image/gif": [],
} as const;

const MAX_BYTES = 10 * 1024 * 1024;

export interface ProductImageUploaderProps {
  productId: string;
  /** When set, uploads target this product option value instead of the product. */
  productOptionValueId?: string;
  /** Expected sorted by `sortOrder` ascending; will be re-sorted defensively. */
  images: ReadProductImageVm[];
  onImagesUpdated: () => Promise<void>;
  disabled?: boolean;
  /** Max simultaneous presign + PUT + commit pipelines (default 3). */
  maxConcurrentUploads?: number;
  /** Max parallel `resizeImageIfNeeded` calls (default 4). */
  maxConcurrentCompression?: number;
  title?: string;
  className?: string;
}

function summarizeRejections(rejections: FileRejection[]): string {
  const parts = rejections.slice(0, 3).map((r) => {
    const name = r.file.name || "file";
    const codes = r.errors.map((e) => e.code).join(", ");
    return `${name}: ${codes}`;
  });
  const more =
    rejections.length > 3 ? ` (+${rejections.length - 3} more)` : "";
  return parts.join("; ") + more;
}

export function ProductImageUploader({
  productId,
  productOptionValueId,
  images,
  onImagesUpdated,
  disabled = false,
  maxConcurrentUploads = 3,
  maxConcurrentCompression = 4,
  title = "Product Images",
  className,
}: ProductImageUploaderProps) {
  const { toast } = useToast();
  const [batchPhase, setBatchPhase] = useState<"idle" | "compressing" | "uploading">("idle");
  const [batchProgress, setBatchProgress] = useState({ done: 0, total: 0 });
  const [isSavingImageOrder, setIsSavingImageOrder] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [draggingImageId, setDraggingImageId] = useState<string | null>(null);
  const [orderedImageIds, setOrderedImageIds] = useState<string[]>([]);

  const sortedImages = useMemo(
    () => [...images].sort((a, b) => a.sortOrder - b.sortOrder),
    [images]
  );

  const serverOrderKey = useMemo(
    () => sortedImages.map((i) => i.id).join("|"),
    [sortedImages]
  );

  useEffect(() => {
    setOrderedImageIds(serverOrderKey === "" ? [] : serverOrderKey.split("|"));
  }, [serverOrderKey]);

  const imageById = useMemo(() => new Map(images.map((i) => [i.id, i])), [images]);

  /** Local drag order, plus any new server images not yet in `orderedImageIds` (before effect runs). */
  const displayImages = useMemo(() => {
    const seen = new Set<string>();
    const list: ReadProductImageVm[] = [];
    for (const id of orderedImageIds) {
      const img = imageById.get(id);
      if (img) {
        list.push(img);
        seen.add(id);
      }
    }
    for (const img of sortedImages) {
      if (!seen.has(img.id)) list.push(img);
    }
    return list;
  }, [orderedImageIds, imageById, sortedImages]);

  const orderDirty = useMemo(() => {
    if (displayImages.length < 2) return false;
    const canonical = sortedImages.map((i) => i.id).join("|");
    const current = displayImages.map((i) => i.id).join("|");
    return canonical !== current;
  }, [displayImages, sortedImages]);

  const isBatchBusy = batchPhase !== "idle";
  const dropDisabled = disabled || isBatchBusy;

  const isOptionValueScope = productOptionValueId != null && productOptionValueId !== "";

  const runUploadBatch = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const validation = acceptedFiles.map((file) => ({
        file,
        ...validateImageFile(file),
      }));
      const invalid = validation.filter((v) => !v.ok);
      const validFiles = validation.filter((v) => v.ok).map((v) => v.file);

      if (invalid.length > 0) {
        toast({
          variant: "destructive",
          title: "Some files were skipped",
          description: invalid
            .slice(0, 3)
            .map((v) => `${v.file.name}: ${v.ok ? "" : v.message}`)
            .join(" · "),
        });
      }

      if (validFiles.length === 0) return;

      const baseSort = sortedImages.length;

      setBatchPhase("compressing");
      setBatchProgress({ done: 0, total: validFiles.length });

      let compressed: File[];
      let compressDone = 0;
      try {
        compressed = await mapConcurrent(
          validFiles,
          maxConcurrentCompression,
          async (file) => {
            try {
              const out = await resizeImageIfNeeded(file);
              compressDone += 1;
              setBatchProgress({ done: compressDone, total: validFiles.length });
              return out;
            } catch {
              compressDone += 1;
              setBatchProgress({ done: compressDone, total: validFiles.length });
              return file;
            }
          }
        );
      } catch (error) {
        setBatchPhase("idle");
        setBatchProgress({ done: 0, total: 0 });
        toast({
          variant: "destructive",
          title: "Image preparation failed",
          description: error instanceof Error ? error.message : "Could not process images.",
        });
        return;
      }

      setBatchPhase("uploading");
      setBatchProgress({ done: 0, total: compressed.length });

      const outcomes = await forEachConcurrent(
        compressed,
        maxConcurrentUploads,
        async (file, batchIdx) => {
          const sortOrder = baseSort + batchIdx;
          const role: "MAIN" | "GALLERY" =
            baseSort === 0 && batchIdx === 0 ? "MAIN" : "GALLERY";
          const safeName = toSafeUploadFileName(file.name);

          const presignResult = isOptionValueScope
            ? await requestOptionValueImageUploadUrl(productId, productOptionValueId, {
                fileName: safeName,
                contentType: file.type,
                contentLength: file.size,
                role,
                sortOrder,
              })
            : await requestProductImageUploadUrl(productId, {
                fileName: safeName,
                contentType: file.type,
                contentLength: file.size,
                role,
                sortOrder,
              });
          if (!presignResult.success) {
            throw new Error(presignResult.message);
          }

          await putFileToPresignedUrl(
            {
              uploadUrl: presignResult.data.uploadUrl,
              httpMethod: presignResult.data.httpMethod,
              headers: presignResult.data.headers,
              contentType: file.type,
            },
            file
          );

          const commitResult = isOptionValueScope
            ? await commitOptionValueImage(productId, productOptionValueId, {
                objectKey: presignResult.data.objectKey,
                contentType: file.type,
                fileSize: file.size,
                role,
                sortOrder,
              })
            : await commitProductImage(productId, {
                objectKey: presignResult.data.objectKey,
                contentType: file.type,
                fileSize: file.size,
                role,
                sortOrder,
              });
          if (!commitResult.success) {
            throw new Error(commitResult.message);
          }

          setBatchProgress((p) => ({
            total: p.total,
            done: Math.min(p.total, p.done + 1),
          }));
        }
      );

      setBatchPhase("idle");
      setBatchProgress({ done: 0, total: 0 });

      const failed = outcomes.filter((o) => o.status === "rejected");
      const ok = outcomes.length - failed.length;

      await onImagesUpdated();

      if (failed.length === 0) {
        toast({
          title: "Images uploaded",
          description:
            ok === 1 ? "1 image uploaded successfully." : `${ok} images uploaded successfully.`,
        });
      } else if (ok === 0) {
        const first = failed[0];
        const msg =
          first.status === "rejected" && first.reason instanceof Error
            ? first.reason.message
            : "Upload failed.";
        toast({ variant: "destructive", title: "Upload failed", description: msg });
      } else {
        toast({
          variant: "destructive",
          title: "Partial upload",
          description: `${ok} succeeded, ${failed.length} failed. Refresh and retry failed files if needed.`,
        });
      }
    },
    [
      productId,
      productOptionValueId,
      isOptionValueScope,
      sortedImages.length,
      maxConcurrentCompression,
      maxConcurrentUploads,
      onImagesUpdated,
      toast,
    ]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      void runUploadBatch(acceptedFiles);
    },
    [runUploadBatch]
  );

  const onDropRejected = useCallback(
    (rejections: FileRejection[]) => {
      if (rejections.length === 0) return;
      toast({
        variant: "destructive",
        title: "Some files were rejected",
        description: summarizeRejections(rejections),
      });
    },
    [toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: DROP_ACCEPT,
    maxSize: MAX_BYTES,
    disabled: dropDisabled,
    multiple: true,
  });

  const handleDragOverImage = (e: DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggingImageId || draggingImageId === targetId) return;
    setOrderedImageIds((prev) => {
      const next = [...prev];
      const from = next.indexOf(draggingImageId);
      const to = next.indexOf(targetId);
      if (from < 0 || to < 0) return prev;
      next.splice(from, 1);
      next.splice(to, 0, draggingImageId);
      return next;
    });
  };

  async function onSaveImageOrder() {
    if (!orderDirty || displayImages.length < 2) return;
    setIsSavingImageOrder(true);
    const result = isOptionValueScope
      ? await reorderOptionValueImages(productId, productOptionValueId, {
          orderedImageIds: displayImages.map((x) => x.id),
        })
      : await reorderProductImages(productId, {
          orderedImageIds: displayImages.map((x) => x.id),
        });
    if (!result.success) {
      toast({ variant: "destructive", title: "Reorder failed", description: result.message });
      setIsSavingImageOrder(false);
      return;
    }
    await onImagesUpdated();
    setIsSavingImageOrder(false);
    toast({
      title: "Order updated",
      description: "Image order has been saved.",
    });
  }

  async function onDeleteImage(imageId: string) {
    setDeletingImageId(imageId);
    const result = isOptionValueScope
      ? await deleteOptionValueImage(productId, productOptionValueId, imageId)
      : await deleteProductImage(productId, imageId);
    if (!result.success) {
      toast({ variant: "destructive", title: "Delete failed", description: result.message });
      setDeletingImageId(null);
      return;
    }
    await onImagesUpdated();
    toast({ title: "Image deleted", description: "Image has been removed." });
    setDeletingImageId(null);
  }

  const reorderLocked = disabled || isBatchBusy || isSavingImageOrder;

  const progressPercent =
    batchProgress.total > 0
      ? Math.round((batchProgress.done / batchProgress.total) * 100)
      : 0;

  return (
    <div className={cn("space-y-3 rounded-md border p-3", className)}>
      <p className="text-sm font-medium">{title}</p>

      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed px-4 py-8 text-center transition-colors",
          dropDisabled && "cursor-not-allowed opacity-50",
          isDragActive && !dropDisabled && "border-primary bg-primary/5",
          !isDragActive && !dropDisabled && "hover:bg-muted/50"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-muted-foreground" aria-hidden />
        <p className="text-sm font-medium">
          {isDragActive ? "Drop images here" : "Drag images here, or click to browse"}
        </p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <ImagePlus className="h-3.5 w-3.5" aria-hidden />
          JPEG, PNG, WebP, GIF · up to 10MB each · multiple files
        </p>
      </div>

      {isBatchBusy && batchProgress.total > 0 && (
        <div className="space-y-1">
          <Progress value={progressPercent} />
          <p className="text-xs text-muted-foreground">
            {batchPhase === "compressing"
              ? `Optimizing… ${batchProgress.done}/${batchProgress.total}`
              : `Uploading… ${batchProgress.done}/${batchProgress.total}`}
          </p>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        First image is the main image. Drag rows to reorder, then save. (Upload area above is only
        for new files.)
      </p>

      {displayImages.length === 0 ? (
        <p className="text-xs text-muted-foreground">No images uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {orderDirty ? (
              <span className="text-xs text-amber-600 dark:text-amber-500">Unsaved order</span>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!orderDirty || displayImages.length < 2 || reorderLocked}
              onClick={() => void onSaveImageOrder()}
            >
              {isSavingImageOrder ? "Saving order…" : "Save image order"}
            </Button>
          </div>
          <div className="space-y-2">
            {displayImages.map((img, index) => (
              <div
                key={img.id}
                draggable={!reorderLocked}
                onDragStart={() => setDraggingImageId(img.id)}
                onDragEnd={() => setDraggingImageId(null)}
                onDragOver={(e) => handleDragOverImage(e, img.id)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded border p-2 transition-colors",
                  draggingImageId === img.id && "border-primary bg-primary/5",
                  !reorderLocked && "cursor-grab active:cursor-grabbing"
                )}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <GripVertical
                    className="h-4 w-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.publicUrl}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded object-cover"
                  />
                  <div className="min-w-0 text-xs">
                    <p className="font-medium">
                      #{index} {index === 0 ? "(MAIN)" : "(GALLERY)"}
                    </p>
                    <p className="truncate text-muted-foreground">{img.id}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={deletingImageId === img.id || isBatchBusy}
                    onClick={() => void onDeleteImage(img.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
