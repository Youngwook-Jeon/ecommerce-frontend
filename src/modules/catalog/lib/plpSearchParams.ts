import {
  PublicProductSortSchema,
  type PublicProductSort,
} from "@/common/schemas/publicProduct";

const DEFAULT_SIZE = 24;
const DEFAULT_SORT: PublicProductSort = "newest";

export interface PlpSearchParams {
  /** API page index (0-based). */
  page: number;
  size: number;
  q?: string;
  sort: PublicProductSort;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
}

type SearchParamValue = string | string[] | undefined;

function first(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function parseOptionalPositiveInt(value: SearchParamValue): number | undefined {
  const raw = first(value);
  if (raw == null || raw.trim() === "") {
    return undefined;
  }
  const parsed = Number(raw);
  if (Number.isNaN(parsed) || parsed < 0) {
    return undefined;
  }
  return parsed;
}

/**
 * Reads Next.js searchParams into API-ready PLP filters.
 * URL {@code page} is 1-based for humans; returned {@code page} is 0-based for the API.
 */
export function parsePlpSearchParams(
  raw: Record<string, SearchParamValue>
): PlpSearchParams {
  const urlPage = parseOptionalPositiveInt(raw.page);
  const apiPage =
    urlPage == null ? 0 : Math.max(0, urlPage <= 0 ? 0 : urlPage - 1);

  const sizeRaw = parseOptionalPositiveInt(raw.size);
  const size = sizeRaw == null || sizeRaw === 0 ? DEFAULT_SIZE : sizeRaw;

  const sortRaw = first(raw.sort);
  const sortParsed = PublicProductSortSchema.safeParse(sortRaw ?? DEFAULT_SORT);
  const sort = sortParsed.success ? sortParsed.data : DEFAULT_SORT;

  const q = first(raw.q)?.trim() || undefined;
  const brand = first(raw.brand)?.trim() || undefined;

  const minPrice = parseOptionalPositiveInt(raw.minPrice);
  const maxPrice = parseOptionalPositiveInt(raw.maxPrice);

  return {
    page: apiPage,
    size,
    q,
    sort: q == null && sort === "relevance" ? DEFAULT_SORT : sort,
    brand,
    minPrice,
    maxPrice,
  };
}

/** Builds query string (without leading {@code ?}) for /categories/[categoryId]. */
export function buildPlpQueryString(params: PlpSearchParams): string {
  const search = new URLSearchParams();
  const urlPage = params.page + 1;

  search.set("page", String(urlPage));
  search.set("size", String(params.size));
  search.set("sort", params.sort);

  if (params.q) {
    search.set("q", params.q);
  }
  if (params.brand) {
    search.set("brand", params.brand);
  }
  if (params.minPrice != null) {
    search.set("minPrice", String(params.minPrice));
  }
  if (params.maxPrice != null) {
    search.set("maxPrice", String(params.maxPrice));
  }

  return search.toString();
}

export function categoryProductsPath(
  categoryId: number,
  params: PlpSearchParams
): string {
  const query = buildPlpQueryString(params);
  return `/categories/${categoryId}?${query}`;
}
