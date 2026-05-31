"use client";

import type { PublicProductFacetVm } from "@/common/schemas/publicProduct";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCategoryPlpNavigation } from "@/modules/catalog/lib/useCategoryPlpNavigation";
import {
  hasActiveCategoryFilters,
  type PlpSearchParams,
} from "@/modules/catalog/lib/plpSearchParams";

import { BrandFacetSection } from "./facets/BrandFacetSection";
import { PriceFacetSection } from "./facets/PriceFacetSection";

interface ProductFilterSidebarProps {
  categoryId: number;
  plpParams: PlpSearchParams;
  facetData: PublicProductFacetVm;
}

export function ProductFilterSidebar({
  categoryId,
  plpParams,
  facetData,
}: ProductFilterSidebarProps) {
  const { patchParams, clearFilters } = useCategoryPlpNavigation(
    categoryId,
    plpParams
  );

  const brandFacet = facetData.facets.find(
    (facet) => facet.key === "brand" && facet.type === "terms"
  );
  const priceFacet = facetData.facets.find(
    (facet) => facet.key === "price" && facet.type === "range"
  );

  const toggleBrand = (brandValue: string, selected: boolean) => {
    if (selected) {
      const nextBrands = (plpParams.brands ?? []).filter((item) => item !== brandValue);
      patchParams({ brands: nextBrands.length > 0 ? nextBrands : undefined });
      return;
    }
    const nextBrands = Array.from(new Set([...(plpParams.brands ?? []), brandValue]));
    patchParams({ brands: nextBrands });
  };

  return (
    <aside className="rounded-lg border bg-card p-4 shadow-sm lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Filters
        </h2>
        {hasActiveCategoryFilters(plpParams) ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={clearFilters}
          >
            Clear all
          </Button>
        ) : null}
      </div>

      <PriceFacetSection
        facet={priceFacet}
        plpParams={plpParams}
        onApplyPrice={(minPrice, maxPrice) => patchParams({ minPrice, maxPrice })}
      />

      <Separator className="my-5" />

      <BrandFacetSection
        facet={brandFacet}
        plpParams={plpParams}
        onToggleBrand={toggleBrand}
        onClearBrands={() => patchParams({ brands: undefined })}
      />
    </aside>
  );
}
