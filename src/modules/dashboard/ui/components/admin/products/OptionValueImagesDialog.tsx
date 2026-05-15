"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReadProductImageVm } from "@/types/productImage";
import { ProductImageUploader } from "./ProductImageUploader";

interface OptionValueImagesDialogProps {
  productId: string;
  productOptionValueId: string | null;
  label: string;
  images: ReadProductImageVm[];
  isOpen: boolean;
  onClose: () => void;
  onImagesUpdated: () => Promise<void>;
  disabled?: boolean;
}

export function OptionValueImagesDialog({
  productId,
  productOptionValueId,
  label,
  images,
  isOpen,
  onClose,
  onImagesUpdated,
  disabled = false,
}: OptionValueImagesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>Option value images</DialogTitle>
          <DialogDescription>
            Manage images for <span className="font-medium">{label}</span>. Used for variant
            thumbnails when this option group is set as the visual group.
          </DialogDescription>
        </DialogHeader>
        {productOptionValueId ? (
          <ProductImageUploader
            productId={productId}
            productOptionValueId={productOptionValueId}
            images={images}
            disabled={disabled}
            onImagesUpdated={onImagesUpdated}
            title="Images"
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
