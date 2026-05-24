export interface PricePreset {
  id: string;
  label: string;
  minPrice?: number;
  maxPrice?: number;
}

export const PRICE_PRESETS: PricePreset[] = [
  { id: "any", label: "Any price" },
  { id: "under-25", label: "Up to $25", maxPrice: 25 },
  { id: "25-50", label: "$25 – $50", minPrice: 25, maxPrice: 50 },
  { id: "50-100", label: "$50 – $100", minPrice: 50, maxPrice: 100 },
  { id: "100-200", label: "$100 – $200", minPrice: 100, maxPrice: 200 },
  { id: "200-plus", label: "$200 & above", minPrice: 200 },
];

export function matchPricePresetId(
  minPrice?: number,
  maxPrice?: number
): string {
  if (minPrice == null && maxPrice == null) {
    return "any";
  }
  const match = PRICE_PRESETS.find(
    (preset) =>
      preset.id !== "any" &&
      preset.minPrice === minPrice &&
      preset.maxPrice === maxPrice
  );
  return match?.id ?? "custom";
}
