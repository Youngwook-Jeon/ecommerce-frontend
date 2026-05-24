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
