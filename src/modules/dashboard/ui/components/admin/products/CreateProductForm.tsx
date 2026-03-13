"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { createProduct, CreateProductRequest } from "@/services/productService";

const CreateProductSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be 100 characters or less."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters."),
  basePrice: z
    .coerce
    .number()
    .positive("Base price must be greater than zero."),
  brand: z
    .string()
    .min(2, "Brand must be at least 2 characters.")
    .max(100, "Brand must be 100 characters or less."),
  categoryId: z
    .coerce
    .number()
    .int("Category ID must be an integer.")
    .positive("Category ID must be a positive number."),
  conditionType: z.enum(["NEW", "USED", "REFURBISHED", "OPEN_BOX"]),
  productStatus: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED", "OUT_OF_STOCK"]),
});

type CreateProductFormValues = z.infer<typeof CreateProductSchema>;

interface CreateProductFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProductForm({ isOpen, onClose }: CreateProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CreateProductFormValues>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      brand: "",
      categoryId: 1,
      conditionType: "NEW",
      productStatus: "ACTIVE",
    },
  });

  async function onSubmit(values: CreateProductFormValues) {
    setIsSubmitting(true);

    const payload: CreateProductRequest = {
      name: values.name,
      description: values.description,
      basePrice: values.basePrice,
      brand: values.brand,
      categoryId: values.categoryId,
      conditionType: values.conditionType,
      productStatus: values.productStatus,
    };

    const result = await createProduct(payload);

    if (result.success) {
      toast({
        title: "Success!",
        description: `Product "${values.name}" has been created.`,
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
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Create a new product. The main image URL will be set to a default
            placeholder for now.
          </DialogDescription>
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
                    <Input
                      placeholder="e.g., Wireless Bluetooth Earbuds"
                      {...field}
                    />
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
                    <Input
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
              <FormField
                control={form.control}
                name="conditionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...field}
                      >
                        <option value="NEW">NEW</option>
                        <option value="USED">USED</option>
                        <option value="REFURBISHED">REFURBISHED</option>
                        <option value="OPEN_BOX">OPEN_BOX</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <select
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        {...field}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="DISCONTINUED">DISCONTINUED</option>
                        <option value="OUT_OF_STOCK">OUT_OF_STOCK</option>
                      </select>
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
                {isSubmitting ? "Creating..." : "Create Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

