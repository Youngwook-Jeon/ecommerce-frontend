import type { PublicProductTermsFacetValueVm } from "@/common/schemas/publicProduct";

export type BrandFacetSortPolicy = "count_desc_then_name_asc";

const DEFAULT_POLICY: BrandFacetSortPolicy = "count_desc_then_name_asc";

export function sortBrandFacetTerms(
  terms: PublicProductTermsFacetValueVm[],
  policy: BrandFacetSortPolicy = DEFAULT_POLICY
): PublicProductTermsFacetValueVm[] {
  if (policy === "count_desc_then_name_asc") {
    return [...terms].sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.value.localeCompare(b.value);
    });
  }

  return [...terms];
}
