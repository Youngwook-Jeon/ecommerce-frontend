"use client";

import { useEffect, useState } from "react";

import type { PublicProductFacetGroupVm } from "@/common/schemas/publicProduct";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  PRICE_PRESETS,
  matchPricePresetId,
} from "@/modules/catalog/lib/plpPricePresets";
import { parsePriceInput, type PlpSearchParams } from "@/modules/catalog/lib/plpSearchParams";

const PRICE_PRESET_TO_FACET_BUCKET: Record<string, string | undefined> = {
  any: undefined,
  "under-25": "under_25",
  "25-50": "25_50",
  "50-100": "50_100",
  "100-200": "100_200",
  "200-plus": "200_plus",
};

interface PriceFacetSectionProps {
  facet?: PublicProductFacetGroupVm;
  plpParams: PlpSearchParams;
  onApplyPrice: (minPrice?: number, maxPrice?: number) => void;
}

export function PriceFacetSection({
  facet,
  plpParams,
  onApplyPrice,
}: PriceFacetSectionProps) {
  const priceCountMap = new Map(
    (facet?.type === "range" ? facet.ranges : []).map((bucket) => [
      bucket.id,
      bucket.count,
    ])
  );

  const activePricePreset = matchPricePresetId(
    plpParams.minPrice,
    plpParams.maxPrice
  );

  const [customMin, setCustomMin] = useState(
    plpParams.minPrice != null ? String(plpParams.minPrice) : ""
  );
  const [customMax, setCustomMax] = useState(
    plpParams.maxPrice != null ? String(plpParams.maxPrice) : ""
  );
  const [priceError, setPriceError] = useState<string | null>(null);
  const [priceSelection, setPriceSelection] = useState(activePricePreset);
  const showCustomPrice = priceSelection === "custom";

  useEffect(() => {
    setPriceSelection(activePricePreset);
  }, [activePricePreset]);

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
    onApplyPrice(preset.minPrice, preset.maxPrice);
  };

  const applyCustomPrice = () => {
    const min = parsePriceInput(customMin);
    const max = parsePriceInput(customMax);

    if (min != null && max != null && min > max) {
      setPriceError("Min must be ≤ max.");
      return;
    }

    setPriceError(null);
    onApplyPrice(min, max);
  };

  const title = facet?.label ?? "Price";

  return (
    <section>
      <h3 className="mb-3 text-sm font-medium">{title}</h3>
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
                  {priceCountMap.get(
                    PRICE_PRESET_TO_FACET_BUCKET[preset.id] ?? ""
                  ) ?? 0}
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
  );
}
