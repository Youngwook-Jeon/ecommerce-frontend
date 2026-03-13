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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AdminProductDtoVm,
  UpdateProductRequest,
  updateProduct,
} from "@/services/productService";

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
  status: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED", "OUT_OF_STOCK"]),
});

type UpdateProductFormValues = z.infer<typeof UpdateProductSchema>;

interface UpdateProductFormProps {
  product: AdminProductDtoVm | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateProductForm({
  product,
  isOpen,
  onClose,
}: UpdateProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (product) {
      const anyProduct = product as any;
      const status =
        (product.status as UpdateProductFormValues["status"]) ?? "ACTIVE";

      form.reset({
        name: product.name,
        description: anyProduct.description ?? "",
        basePrice: product.basePrice,
        brand: product.brand,
        categoryId: product.categoryId ?? 1,
        status,
      });
    }
  }, [product, form]);

  async function onSubmit(values: UpdateProductFormValues) {
    if (!product) return;

    setIsSubmitting(true);

    const payload: UpdateProductRequest = {
      name: values.name,
      description: values.description,
      basePrice: values.basePrice,
      brand: values.brand,
      categoryId: values.categoryId,
      status: values.status,
    };

    const result = await updateProduct(product.id, payload);

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

    setIsSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the product details.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Wireless Bluetooth Earbuds" {...field} />
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
                      <Input placeholder="e.g., SoundMax" {...field} />
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
                    value={product?.conditionType ?? ""}
                    disabled
                    readOnly
                  />
                </FormControl>
              </FormItem>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                          <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                          <SelectItem value="DISCONTINUED">DISCONTINUED</SelectItem>
                          <SelectItem value="OUT_OF_STOCK">OUT_OF_STOCK</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <p className="text-xs text-muted-foreground">
              Main image URL will be set to{" "}
              <code>https://example.com/images/default-product.jpg</code>.
            </p>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

