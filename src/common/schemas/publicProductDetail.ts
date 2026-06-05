import { z } from "zod";

/** Aligns with product-service {@code ProductStatus} strings exposed on PDP. */
export const PublicProductStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "INACTIVE",
  "DISCONTINUED",
  "OUT_OF_STOCK",
  "DELETED",
]);

export type PublicProductStatus = z.infer<typeof PublicProductStatusSchema>;

export const PublicProductConditionTypeSchema = z.enum([
  "NEW",
  "USED",
  "REFURBISHED",
  "OPEN_BOX",
]);

export const PublicProductImageSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  role: z.string(),
  sortOrder: z.number().int().nonnegative(),
});

export type PublicProductImageVm = z.infer<typeof PublicProductImageSchema>;

export const PublicProductOptionValueSchema = z.object({
  productOptionValueId: z.string().uuid(),
  optionValueId: z.string().uuid(),
  displayName: z.string().nullish(),
  priceDelta: z.number(),
  isDefault: z.boolean(),
  images: z.array(PublicProductImageSchema),
});

export type PublicProductOptionValueVm = z.infer<typeof PublicProductOptionValueSchema>;

export const PublicProductOptionGroupSchema = z.object({
  productOptionGroupId: z.string().uuid(),
  optionGroupId: z.string().uuid(),
  groupKey: z.string().nullish(),
  displayName: z.string().nullish(),
  stepOrder: z.number(),
  required: z.boolean(),
  drivesVariantImages: z.boolean(),
  optionValues: z.array(PublicProductOptionValueSchema),
});

export type PublicProductOptionGroupVm = z.infer<typeof PublicProductOptionGroupSchema>;

export const PublicProductVariantSchema = z.object({
  productVariantId: z.string().uuid(),
  sku: z.string(),
  stockQuantity: z.number().int(),
  calculatedPrice: z.number(),
  mainImageUrl: z.string().nullish(),
  selectedProductOptionValueIds: z.array(z.string().uuid()),
});

export type PublicProductVariantVm = z.infer<typeof PublicProductVariantSchema>;

/**
 * GET /public/products/{productId} — Phase 0 contract.
 * DRAFT / DELETED / missing → HTTP 404 → {@code notFound()}.
 */
export const PublicProductDetailSchema = z.object({
  id: z.string().uuid(),
  categoryId: z.number().int().positive().nullish(),
  name: z.string(),
  description: z.string().nullish(),
  brand: z.string().nullish(),
  mainImageUrl: z.string().nullish(),
  basePrice: z.number(),
  status: PublicProductStatusSchema,
  conditionType: PublicProductConditionTypeSchema.nullish(),
  purchasable: z.boolean(),
  listedInCatalog: z.boolean(),
  images: z.array(PublicProductImageSchema),
  optionGroups: z.array(PublicProductOptionGroupSchema),
  variants: z.array(PublicProductVariantSchema),
});

export type PublicProductDetailVm = z.infer<typeof PublicProductDetailSchema>;

/** UI helpers derived from API flags (Phase 2+). */
export function isPublicProductPreview(detail: PublicProductDetailVm): boolean {
  return detail.status === "INACTIVE";
}

export function canPurchasePublicProduct(detail: PublicProductDetailVm): boolean {
  return detail.purchasable;
}
