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

/** Single value in a `terms`-type facet (brand, option groups, etc.). */
export const PublicProductTermsFacetValueSchema = z.object({
  value: z.string(),
  /** Display label when `value` is an opaque id (e.g. option value uuid). */
  label: z.string().optional(),
  count: z.number().int().nonnegative(),
  selected: z.boolean(),
});

export type PublicProductTermsFacetValueVm = z.infer<
  typeof PublicProductTermsFacetValueSchema
>;

const publicProductFacetGroupBaseSchema = z.object({
  key: z.string(),
  /** Section title; falls back to derived title from `key` in UI when absent. */
  label: z.string().optional(),
  /** Global option group id when `key` is `option:<groupKey>`. */
  optionGroupId: z.string().uuid().optional(),
});

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
  publicProductFacetGroupBaseSchema.extend({
    type: z.literal("terms"),
    terms: z.array(PublicProductTermsFacetValueSchema),
    ranges: z.array(PublicProductPriceFacetBucketSchema),
  }),
  publicProductFacetGroupBaseSchema.extend({
    type: z.literal("range"),
    terms: z.array(PublicProductTermsFacetValueSchema),
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
