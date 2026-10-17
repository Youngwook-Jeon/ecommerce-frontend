"use client";

import type { PublicProductFacetGroupVm } from "@/common/schemas/publicProduct";
import { sortBrandFacetTerms } from "@/modules/catalog/lib/brandFacetSortPolicy";
import type { PlpSearchParams } from "@/modules/catalog/lib/plpSearchParams";

import { TermsFacetSection } from "./TermsFacetSection";

interface BrandFacetSectionProps {
  facet?: PublicProductFacetGroupVm;
  plpParams: PlpSearchParams;
  onToggleBrand: (brandValue: string, selected: boolean) => void;
  onClearBrands: () => void;
}

export function BrandFacetSection({
  facet,
  plpParams,
  onToggleBrand,
  onClearBrands,
}: BrandFacetSectionProps) {
  const sortedTerms = sortBrandFacetTerms(
    facet?.type === "terms"
      ? facet.values.map((term) => ({
          ...term,
          selected: plpParams.brands?.includes(term.value) ?? false,
        }))
      : []
  );
  const title = facet?.label ?? "Brand";

  return (
    <div>
      <TermsFacetSection
        title={title}
        terms={sortedTerms}
        onToggle={onToggleBrand}
        onClearSelected={onClearBrands}
        hasActiveSelection={(plpParams.brands?.length ?? 0) > 0}
        emptyMessage="No brands (0)"
        clearButtonLabel="Clear selected brands"
      />
      {facet?.type === "terms" && facet.hasMore ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Showing the top 50 brands. Refine your search for more.
        </p>
      ) : null}
    </div>
  );
}
