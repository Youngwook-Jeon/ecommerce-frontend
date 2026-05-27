"use client";

import { useEffect, useState } from "react";

import type { PublicProductFacetVm } from "@/common/schemas/publicProduct";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  PRICE_PRESETS,
  matchPricePresetId,
} from "@/modules/catalog/lib/plpPricePresets";
import { useCategoryPlpNavigation } from "@/modules/catalog/lib/useCategoryPlpNavigation";
import {
  hasActiveCategoryFilters,
  parsePriceInput,
  type PlpSearchParams,
} from "@/modules/catalog/lib/plpSearchParams";

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

  const [brandInput, setBrandInput] = useState(plpParams.brand ?? "");
  const [customMin, setCustomMin] = useState(
    plpParams.minPrice != null ? String(plpParams.minPrice) : ""
  );
  const [customMax, setCustomMax] = useState(
    plpParams.maxPrice != null ? String(plpParams.maxPrice) : ""
  );
  const [priceError, setPriceError] = useState<string | null>(null);
  const priceCountMap = new Map(facetData.priceBuckets.map((b) => [b.id, b.count]));
  const pricePresetToFacetBucket: Record<string, string | undefined> = {
    any: undefined,
    "under-25": "under_25",
    "25-50": "25_50",
    "50-100": "50_100",
    "100-200": "100_200",
    "200-plus": "200_plus",
  };

  const activePricePreset = matchPricePresetId(
    plpParams.minPrice,
    plpParams.maxPrice
  );
  const [priceSelection, setPriceSelection] = useState(activePricePreset);
  const showCustomPrice = priceSelection === "custom";

  useEffect(() => {
    setPriceSelection(activePricePreset);
  }, [activePricePreset]);

  useEffect(() => {
    setBrandInput(plpParams.brand ?? "");
  }, [plpParams.brand]);

  useEffect(() => {
    setCustomMin(plpParams.minPrice != null ? String(plpParams.minPrice) : "");
    setCustomMax(plpParams.maxPrice != null ? String(plpParams.maxPrice) : "");
    setPriceError(null);
  }, [plpParams.minPrice, plpParams.maxPrice]);

  const selectPricePreset = (presetId: string) => {
    setPriceSelection(presetId);
    if (presetId === "custom") {
      return;
    }
    const preset = PRICE_PRESETS.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }
    setPriceError(null);
    patchParams({
      minPrice: preset.minPrice,
      maxPrice: preset.maxPrice,
    });
  };

  const applyCustomPrice = () => {
    const min = parsePriceInput(customMin);
    const max = parsePriceInput(customMax);

    if (min != null && max != null && min > max) {
      setPriceError("Min must be ≤ max.");
      return;
    }

    setPriceError(null);
    patchParams({ minPrice: min, maxPrice: max });
  };

  const applyBrand = () => {
    patchParams({ brand: brandInput.trim() || undefined });
  };

  const clearBrand = () => {
    setBrandInput("");
    patchParams({ brand: undefined });
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

      <section>
        <h3 className="mb-3 text-sm font-medium">Price</h3>
        <RadioGroup
          value={priceSelection}
          onValueChange={selectPricePreset}
          className="gap-2.5"
        >
          {PRICE_PRESETS.map((preset) => (
            <div key={preset.id} className="flex items-center gap-2">
              <RadioGroupItem value={preset.id} id={`price-${preset.id}`} />
              <Label
                htmlFor={`price-${preset.id}`}
                className="cursor-pointer font-normal"
              >
                {preset.label}
                {preset.id !== "any" ? (
                  <span className="ml-1 text-xs text-muted-foreground">
                    (
                    {priceCountMap.get(pricePresetToFacetBucket[preset.id] ?? "") ?? 0}
                    )
                  </span>
                ) : null}
              </Label>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <RadioGroupItem value="custom" id="price-custom" />
            <Label htmlFor="price-custom" className="cursor-pointer font-normal">
              Custom range
            </Label>
          </div>
        </RadioGroup>

        {showCustomPrice ? (
          <div className="mt-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="custom-min" className="text-xs">
                  Min ($)
                </Label>
                <Input
                  id="custom-min"
                  type="number"
                  min={0}
                  step="0.01"
                  value={customMin}
                  onChange={(e) => setCustomMin(e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="custom-max" className="text-xs">
                  Max ($)
                </Label>
                <Input
                  id="custom-max"
                  type="number"
                  min={0}
                  step="0.01"
                  value={customMax}
                  onChange={(e) => setCustomMax(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="w-full"
              onClick={applyCustomPrice}
            >
              Apply range
            </Button>
            {priceError ? (
              <p className="text-xs text-destructive">{priceError}</p>
            ) : null}
          </div>
        ) : null}
      </section>

      <Separator className="my-5" />

      <section>
        <h3 className="mb-3 text-sm font-medium">Brand</h3>
        <div className="mb-3 space-y-1">
          {facetData.brands.map((brand) => (
            <button
              key={brand.value}
              type="button"
              onClick={() =>
                patchParams({ brand: brand.selected ? undefined : brand.value })
              }
              className="flex w-full items-center justify-between rounded px-1.5 py-1 text-left text-sm hover:bg-muted"
            >
              <span className={brand.selected ? "font-semibold" : "font-normal"}>
                {brand.value}
              </span>
              <span className="text-xs text-muted-foreground">{brand.count}</span>
            </button>
          ))}
        </div>
        <p className="mb-2 text-xs text-muted-foreground">
          Can't find your brand? type exact name.
        </p>
        <Input
          value={brandInput}
          onChange={(e) => setBrandInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applyBrand();
            }
          }}
          placeholder="e.g. Nike"
          className="mb-2"
        />
        <div className="flex gap-2">
          <Button type="button" size="sm" className="flex-1" onClick={applyBrand}>
            Apply
          </Button>
          {plpParams.brand ? (
            <Button type="button" size="sm" variant="outline" onClick={clearBrand}>
              Clear
            </Button>
          ) : null}
        </div>
      </section>
    </aside>
  );
}
