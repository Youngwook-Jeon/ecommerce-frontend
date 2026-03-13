"use client";

import { useState } from "react";
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
import { AdminProductDtoVm, deleteProduct } from "@/services/productService";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    if (!product) return;

    setIsDeleting(true);
    const result = await deleteProduct(product.id);

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
            <span className="font-semibold">&quot;{product?.name}&quot;</span> as
            deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
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

