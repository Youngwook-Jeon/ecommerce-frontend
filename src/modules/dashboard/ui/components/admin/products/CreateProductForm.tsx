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
import { createProduct, CreateProductRequest } from "@/services/productService";
import { AdminProductDetailVm, fetchAdminProductDetail } from "@/services/adminProductClient";
import type { ReadProductImageVm } from "@/types/productImage";
import { ProductImageUploader } from "./ProductImageUploader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  status: z.enum(["ACTIVE", "INACTIVE", "DISCONTINUED", "OUT_OF_STOCK"]),
});

type CreateProductFormValues = z.infer<typeof CreateProductSchema>;

interface CreateProductFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProductForm({ isOpen, onClose }: CreateProductFormProps) {
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminProductDetailVm | null>(null);

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
      status: "ACTIVE",
    },
  });

  const { isSubmitting } = form.formState;

  const sortedImages: ReadProductImageVm[] = [...(detail?.images ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder
  );

  useEffect(() => {
    if (isOpen) return;
    setCreatedProductId(null);
    setDetail(null);
    form.reset({
      name: "",
      description: "",
      basePrice: 0,
      brand: "",
      categoryId: 1,
      conditionType: "NEW",
      status: "ACTIVE",
    });
  }, [isOpen, form]);

  async function reloadProductDetail(targetProductId: string) {
    const data = await fetchAdminProductDetail(targetProductId);
    setDetail(data);
  }

  async function onSubmit(values: CreateProductFormValues) {
    const payload: CreateProductRequest = {
      name: values.name,
      description: values.description,
      basePrice: values.basePrice,
      brand: values.brand,
      categoryId: values.categoryId,
      conditionType: values.conditionType,
      status: values.status,
    };

    const result = await createProduct(payload);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: result.message,
      });
      return;
    }

    const newId = result.data.id;
    setCreatedProductId(newId);
    try {
      await reloadProductDetail(newId);
    } catch (error) {
      console.error("Failed to load new product detail", error);
      toast({
        variant: "destructive",
        title: "Product created",
        description: "Images could not be loaded yet. You can add them from Edit product.",
      });
      setDetail({
        id: newId,
        categoryId: values.categoryId,
        name: values.name,
        description: values.description,
        brand: values.brand,
        mainImageUrl: null,
        basePrice: values.basePrice,
        status: values.status,
        conditionType: values.conditionType,
        createdAt: "",
        updatedAt: "",
        images: [],
      });
    }

    toast({
      title: "Success!",
      description: `Product "${values.name}" has been created. Add images below, or click Done.`,
    });
    router.refresh();
  }

  function handleDone() {
    onClose();
    router.refresh();
  }

  const isImageStep = createdProductId != null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isImageStep ? "Add product images" : "Create New Product"}</DialogTitle>
          <DialogDescription>
            {isImageStep
              ? "Upload images, reorder to set the main image (first in the list), then click Done."
              : "Create a new product. You can add images right after it is created."}
          </DialogDescription>
        </DialogHeader>

        {!isImageStep ? (
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
                <FormField
                  control={form.control}
                  name="conditionType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NEW">NEW</SelectItem>
                            <SelectItem value="USED">USED</SelectItem>
                            <SelectItem value="REFURBISHED">REFURBISHED</SelectItem>
                            <SelectItem value="OPEN_BOX">OPEN_BOX</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
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
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{detail?.name ?? form.getValues("name")}</span>
              {" · "}
              ID: <code className="text-xs">{createdProductId}</code>
            </p>

            {createdProductId ? (
              <ProductImageUploader
                productId={createdProductId}
                images={sortedImages}
                onImagesUpdated={async () => {
                  await reloadProductDetail(createdProductId);
                  router.refresh();
                }}
              />
            ) : null}

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={handleDone}>
                Done
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
