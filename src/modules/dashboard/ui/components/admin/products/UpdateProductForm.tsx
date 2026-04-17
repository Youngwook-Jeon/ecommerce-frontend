"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  UpdateProductRequest,
  updateProduct,
} from "@/services/productService";
import { AdminProductDetailVm, fetchAdminProductDetail } from "@/services/adminProductClient";

const UpdateProductSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be 100 characters or less."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters."),
  basePrice: z.coerce
    .number()
    .positive("Base price must be greater than zero."),
  brand: z
    .string()
    .min(2, "Brand must be at least 2 characters.")
    .max(100, "Brand must be 100 characters or less."),
  categoryId: z.coerce
    .number()
    .int("Category ID must be an integer.")
    .positive("Category ID must be a positive number."),
});

type UpdateProductFormValues = z.infer<typeof UpdateProductSchema>;

interface UpdateProductFormProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateProductForm({
  productId,
  isOpen,
  onClose,
}: UpdateProductFormProps) {
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detail, setDetail] = useState<AdminProductDetailVm | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<UpdateProductFormValues>({
    resolver: zodResolver(UpdateProductSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      brand: "",
      categoryId: 1,
    },
  });

  const { isSubmitting } = form.formState;

  useEffect(() => {
    if (!isOpen || !productId) {
      return;
    }

    let cancelled = false;
    setIsLoadingDetail(true);

    fetchAdminProductDetail(productId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);

        form.reset({
          name: data.name,
          description: data.description ?? "",
          basePrice: data.basePrice,
          brand: data.brand ?? "",
          categoryId: data.categoryId ?? 1,
        });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load product detail", error);
        toast({
          variant: "destructive",
          title: "Failed to load product",
          description: "Could not load product details for editing.",
        });
        onClose();
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDetail(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, productId, form, toast, onClose]);

  async function onSubmit(values: UpdateProductFormValues) {
    if (!productId) return;

    const payload: UpdateProductRequest = {
      name: values.name,
      description: values.description,
      basePrice: values.basePrice,
      brand: values.brand,
      categoryId: values.categoryId,
    };

    const result = await updateProduct(productId, payload);

    if (result.success) {
      toast({
        title: "Success!",
        description: `Product "${values.name}" has been updated.`,
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
  }

  const isDisabled = isLoadingDetail || isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the product details.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isLoadingDetail && (
              <p className="text-sm font-medium text-blue-600 animate-pulse">
                Loading product details...
              </p>
            )}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Wireless Bluetooth Earbuds" disabled={isDisabled} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Short description of the product"
                      disabled={isDisabled}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="basePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="e.g., 79.99"
                        disabled={isDisabled}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., SoundMax" disabled={isDisabled} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category ID</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g., 1"
                      disabled={isDisabled}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormItem>
                <FormLabel>Condition (read-only)</FormLabel>
                <FormControl>
                  <Input
                    value={detail?.conditionType ?? ""}
                    disabled
                    readOnly
                  />
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel>Current Status (read-only)</FormLabel>
                <FormControl>
                  <Input value={detail?.status ?? ""} disabled readOnly />
                </FormControl>
              </FormItem>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormItem>
                <FormLabel>Created At</FormLabel>
                <FormControl>
                  <Input
                    value={
                      detail?.createdAt
                        ? new Date(detail.createdAt).toLocaleString()
                        : ""
                    }
                    disabled
                    readOnly
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Last Updated At</FormLabel>
                <FormControl>
                  <Input
                    value={
                      detail?.updatedAt
                        ? new Date(detail.updatedAt).toLocaleString()
                        : ""
                    }
                    disabled
                    readOnly
                  />
                </FormControl>
              </FormItem>
            </div>

            <p className="text-xs text-muted-foreground">
              Main image URL will be set to{" "}
              <code>https://example.com/images/default-product.jpg</code>.
            </p>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isDisabled}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}