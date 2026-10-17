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
  category: z.object({ id: z.number().int().positive(), name: z.string() }),
  name: z.string(),
  brand: z.string().nullable(),
  mainImageUrl: z.string().nullable(),
  basePrice: z.number().finite().nonnegative(),
});
export type PublicProductSummaryVm = z.infer<typeof PublicProductSummarySchema>;

export const PublicProductTermsFacetValueSchema = z.object({
  value: z.string(),
  label: z.string(),
  count: z.number().int().nonnegative(),
});
// Selection is URL state, rather than part of the API response.
export type PublicProductTermsFacetValueVm = z.infer<typeof PublicProductTermsFacetValueSchema> & {
  selected: boolean;
};

export const PublicProductFacetGroupSchema = z.discriminatedUnion("type", [
  z.object({
    key: z.string(),
    label: z.string(),
    type: z.literal("terms"),
    values: z.array(PublicProductTermsFacetValueSchema),
    hasMore: z.boolean(),
  }),
  z.object({
    key: z.string(),
    label: z.string(),
    type: z.literal("range"),
    min: z.number().finite().nonnegative().nullable(),
    max: z.number().finite().nonnegative().nullable(),
  }),
]);
export type PublicProductFacetGroupVm = z.infer<typeof PublicProductFacetGroupSchema>;

// Ignore future facet types; continue validating every field of known types.
const FacetsSchema = z.array(z.unknown())
  .transform((facets) => facets.filter((facet) => {
    if (typeof facet !== "object" || facet === null || !("type" in facet) || typeof facet.type !== "string") {
      return true;
    }
    return facet.type === "terms" || facet.type === "range";
  }))
  .pipe(z.array(PublicProductFacetGroupSchema))
  .superRefine((facets, context) => {
    if (new Set(facets.map((facet) => facet.key)).size !== facets.length) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Duplicate facet keys" });
    }
    for (const facet of facets) {
      if (facet.type === "range" && facet.min !== null && facet.max !== null && facet.min > facet.max) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Invalid facet range" });
      }
    }
  });

export const PublicProductSearchSchema = z.object({
  query: z.object({ q: z.string().nullable(), sort: PublicProductSortSchema }),
  content: z.array(PublicProductSummarySchema),
  page: z.number().int().nonnegative(),
  size: z.number().int().min(1).max(48),
  totalElements: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
  facets: FacetsSchema,
});
export type PublicProductSearchVm = z.infer<typeof PublicProductSearchSchema>;
