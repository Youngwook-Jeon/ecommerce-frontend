import {
  PublicProductSortSchema,
  type PublicProductSort,
} from "@/common/schemas/publicProduct";
import { PublicProductApiError } from "@/common/errors/publicProductApiError";

export const MAX_SEARCH_WINDOW = 10000;
export interface PlpSearchParams {
  /** Both URL and API use a zero-based page index. */
  page: number;
  size: number;
  q?: string;
  sort: PublicProductSort;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
}

type SearchParamValue = string | string[] | undefined;
function single(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    throw new PublicProductApiError("Repeated search parameter.", 400);
  }
  return value;
}
function invalid(): never {
  throw new PublicProductApiError("Invalid search parameters.", 400);
}
function integer(value: SearchParamValue, fallback: number): number {
  const raw = single(value);
  if (raw === undefined) return fallback;
  if (!/^\d+$/.test(raw)) invalid();
  const number = Number(raw);
  if (!Number.isSafeInteger(number)) invalid();
  return number;
}
function price(value: SearchParamValue): number | undefined {
  const raw = single(value);
  if (raw === undefined) return undefined;
  if (!/^\d+(?:\.\d{1,2})?$/.test(raw)) invalid();
  const number = Number(raw);
  if (!Number.isFinite(number)) invalid();
  return number;
}
export function normalizeSearchTerm(value: string): string {
  return value.normalize("NFC").trim().replace(/\s+/gu, " ");
}
export function parsePlpSearchParams(raw: Record<string, SearchParamValue>): PlpSearchParams {
  const q = normalizeSearchTerm(single(raw.q) ?? "") || undefined;
  if (q && Array.from(q).length > 200) invalid();
  const page = integer(raw.page, 0);
  const size = integer(raw.size, 24);
  if (size < 1 || size > 48) invalid();
  if (page * size + size > MAX_SEARCH_WINDOW) {
    throw new PublicProductApiError("Search page limit exceeded.", 400,
      JSON.stringify({ code: "SEARCH_PAGE_LIMIT_EXCEEDED" }));
  }
  const sort = PublicProductSortSchema.safeParse(single(raw.sort) ?? (q ? "relevance" : "newest"));
  if (!sort.success || (!q && sort.data === "relevance")) invalid();
  const candidates = raw.brands === undefined ? [] : Array.isArray(raw.brands) ? raw.brands : [raw.brands];
  const brands = [...new Set(candidates.map((brand) => brand.normalize("NFC").trim().toLowerCase().normalize("NFC")).filter(Boolean))];
  if (brands.length > 20 || brands.some((brand) => Array.from(brand).length > 100)) invalid();
  const minPrice = price(raw.minPrice);
  const maxPrice = price(raw.maxPrice);
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) invalid();
  return { page, size, q, sort: sort.data, brands: brands.length ? brands : undefined, minPrice, maxPrice };
}
export function buildPlpQueryString(params: PlpSearchParams): string {
  const search = new URLSearchParams({ page: String(params.page), size: String(params.size), sort: params.sort });
  if (params.q) search.set("q", params.q);
  for (const brand of params.brands ?? []) search.append("brands", brand);
  if (params.minPrice !== undefined) search.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) search.set("maxPrice", String(params.maxPrice));
  return search.toString();
}
export function catalogProductsPath(categoryId: number | undefined, params: PlpSearchParams): string {
  return `${categoryId === undefined ? "/search" : `/categories/${categoryId}`}?${buildPlpQueryString(params)}`;
}
export function hasActiveCatalogFilters(params: PlpSearchParams): boolean {
  return !!params.brands?.length || params.minPrice !== undefined || params.maxPrice !== undefined;
}
export function mergePlpParams(base: PlpSearchParams, patch: Partial<PlpSearchParams>): PlpSearchParams {
  const q = "q" in patch ? normalizeSearchTerm(patch.q ?? "") || undefined : base.q;
  const sort = patch.sort ?? (q !== base.q ? (q ? "relevance" : "newest") : base.sort);
  return { ...base, ...patch, page: 0, q, sort: !q && sort === "relevance" ? "newest" : sort };
}
export function clearPlpFilters(base: PlpSearchParams): PlpSearchParams {
  return { ...base, page: 0, brands: undefined, minPrice: undefined, maxPrice: undefined };
}
export function parsePriceInput(value: string): number | undefined {
  const raw = value.trim();
  return /^\d+(?:\.\d{1,2})?$/.test(raw) && Number.isFinite(Number(raw)) ? Number(raw) : undefined;
}
