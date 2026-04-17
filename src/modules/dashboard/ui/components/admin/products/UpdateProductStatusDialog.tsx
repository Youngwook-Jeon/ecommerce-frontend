"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminProductDtoVm, updateProductStatus } from "@/services/productService";

type ProductStatusValue = "ACTIVE" | "INACTIVE" | "OUT_OF_STOCK";

interface UpdateProductStatusDialogProps {
  product: AdminProductDtoVm | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateProductStatusDialog({
  product,
  isOpen,
  onClose,
}: UpdateProductStatusDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [status, setStatus] = useState<ProductStatusValue>("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !product) return;
    const next = (product.status as ProductStatusValue) ?? "ACTIVE";
    setStatus(next);
  }, [isOpen, product]);

  async function onSubmit() {
    if (!product) return;

    setIsSubmitting(true);
    const result = await updateProductStatus(product.id, { status });
    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: "Success!",
        description: `Product status has been updated to ${status}.`,
      });
      onClose();
      router.refresh();
      return;
    }

    toast({
      variant: "destructive",
      title: "Failed to update status",
      description: result.message,
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Update Product Status</DialogTitle>
          <DialogDescription>
            Change status for <span className="font-medium">{product?.name ?? "-"}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Select a new status</p>
          <Select
            value={status}
            onValueChange={(value) => setStatus(value as ProductStatusValue)}
            disabled={!product || isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">ACTIVE</SelectItem>
              <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              <SelectItem value="OUT_OF_STOCK">OUT_OF_STOCK</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={onSubmit} disabled={!product || isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

