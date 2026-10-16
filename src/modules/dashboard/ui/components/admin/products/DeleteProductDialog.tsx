"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AdminProductDtoVm, deleteProduct, getAdminProductDetail } from "@/services/productService";

interface DeleteProductDialogProps {
  product: AdminProductDtoVm | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteProductDialog({
  product,
  isOpen,
  onClose,
}: DeleteProductDialogProps) {
  const [snapshotName, setSnapshotName] = useState("");
  const [version, setVersion] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    setVersion(null);
    setSnapshotName("");
    if (isOpen && product) {
      getAdminProductDetail(product.id).then((detail) => {
        if (!cancelled && detail) {
          setVersion(detail.version);
          setSnapshotName(detail.name);
        } else if (!cancelled) {
          toast({ variant: "destructive", title: "Failed to load product", description: "Reopen this dialog to load the latest product." });
        }
      });
    }
    return () => { cancelled = true; };
  }, [isOpen, product, toast]);

  const handleDelete = async () => {
    if (!product || version === null) return;

    setIsDeleting(true);
    const result = await deleteProduct(product.id, version);

    if (result.success) {
      toast({
        title: "Success!",
        description: `Product "${product.name}" has been deleted.`,
      });
      onClose();
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: result.message,
      });
    }
    setIsDeleting(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will mark the product{" "}
            <span className="font-semibold">&quot;{snapshotName || product?.name}&quot;</span> as
            deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleDelete}
              disabled={isDeleting || version === null}
              variant="destructive"
            >
              {isDeleting ? "Deleting..." : "Continue"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

