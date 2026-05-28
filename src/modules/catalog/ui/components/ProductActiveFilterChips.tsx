"use client";

import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PRICE_PRESETS } from "@/modules/catalog/lib/plpPricePresets";
import { useCategoryPlpNavigation } from "@/modules/catalog/lib/useCategoryPlpNavigation";
import {
  hasActiveCategoryFilters,
  type PlpSearchParams,
} from "@/modules/catalog/lib/plpSearchParams";

interface ProductActiveFilterChipsProps {
  categoryId: number;
  plpParams: PlpSearchParams;
}

function formatPriceLabel(minPrice?: number, maxPrice?: number): string {
  const preset = PRICE_PRESETS.find(
    (p) => p.minPrice === minPrice && p.maxPrice === maxPrice
  );
  if (preset && preset.id !== "any") {
    return preset.label;
  }
  if (minPrice != null && maxPrice != null) {
    return `$${minPrice} – $${maxPrice}`;
  }
  if (minPrice != null) {
    return `From $${minPrice}`;
  }
  if (maxPrice != null) {
    return `Up to $${maxPrice}`;
  }
  return "Price";
}

export function ProductActiveFilterChips({
  categoryId,
  plpParams,
}: ProductActiveFilterChipsProps) {
  const { patchParams, clearFilters } = useCategoryPlpNavigation(
    categoryId,
    plpParams
  );

  if (!hasActiveCategoryFilters(plpParams)) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active:</span>

      {(plpParams.brands ?? []).map((brand) => (
        <Badge key={brand} variant="secondary" className="gap-1 pr-1">
          Brand: {brand}
          <button
            type="button"
            className="rounded-full p-0.5 hover:bg-muted"
            aria-label={`Remove brand ${brand}`}
            onClick={() =>
              patchParams({
                brands:
                  (plpParams.brands ?? []).filter((item) => item !== brand).length > 0
                    ? (plpParams.brands ?? []).filter((item) => item !== brand)
                    : undefined,
              })
            }
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}

      {plpParams.minPrice != null || plpParams.maxPrice != null ? (
        <Badge variant="secondary" className="gap-1 pr-1">
          {formatPriceLabel(plpParams.minPrice, plpParams.maxPrice)}
          <button
            type="button"
            className="rounded-full p-0.5 hover:bg-muted"
            aria-label="Remove price filter"
            onClick={() =>
              patchParams({ minPrice: undefined, maxPrice: undefined })
            }
          >
            <X className="size-3" />
          </button>
        </Badge>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 text-xs"
        onClick={clearFilters}
      >
        Clear all
      </Button>
    </div>
  );
}
