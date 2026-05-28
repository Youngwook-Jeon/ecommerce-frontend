import { z } from "zod";

export const PublicProductSortSchema = z.enum([
  "newest",
  "price_asc",
  "price_desc",
  "relevance",
]);

export type PublicProductSort = z.infer<typeof PublicProductSortSchema>;

export const PublicProductSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  brand: z.string().nullish(),
  mainImageUrl: z.string().nullish(),
  basePrice: z.number(),
});

export type PublicProductSummaryVm = z.infer<typeof PublicProductSummarySchema>;

export const PublicProductPageSchema = z.object({
  content: z.array(PublicProductSummarySchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().positive(),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export type PublicProductPageVm = z.infer<typeof PublicProductPageSchema>;

export const PublicProductBrandFacetValueSchema = z.object({
  value: z.string(),
  count: z.number().int().nonnegative(),
  selected: z.boolean(),
});

export type PublicProductBrandFacetValueVm = z.infer<
  typeof PublicProductBrandFacetValueSchema
>;

export const PublicProductPriceFacetBucketSchema = z.object({
  id: z.string(),
  label: z.string(),
  min: z.number().nullable().optional(),
  max: z.number().nullable().optional(),
  count: z.number().int().nonnegative(),
});

export type PublicProductPriceFacetBucketVm = z.infer<
  typeof PublicProductPriceFacetBucketSchema
>;

export const PublicProductFacetGroupSchema = z.discriminatedUnion("type", [
  z.object({
    key: z.string(),
    type: z.literal("terms"),
    terms: z.array(PublicProductBrandFacetValueSchema),
    ranges: z.array(PublicProductPriceFacetBucketSchema),
  }),
  z.object({
    key: z.string(),
    type: z.literal("range"),
    terms: z.array(PublicProductBrandFacetValueSchema),
    ranges: z.array(PublicProductPriceFacetBucketSchema),
  }),
]);

export type PublicProductFacetGroupVm = z.infer<typeof PublicProductFacetGroupSchema>;

export const PublicProductFacetSchema = z.object({
  categoryId: z.number().int().positive(),
  totalMatching: z.number().int().nonnegative(),
  facets: z.array(PublicProductFacetGroupSchema),
});

export type PublicProductFacetVm = z.infer<typeof PublicProductFacetSchema>;
