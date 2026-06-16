import { cache } from "react";

import { STOREFRONT_PDP_REVALIDATE_SECONDS, resolveStorefrontPublicGetInit } from "@/common/constants/storefrontCache";
import {
  PublicProductFacetSchema,
  PublicProductPageSchema,
  type PublicProductFacetVm,
  type PublicProductPageVm,
  type PublicProductSort,
} from "@/common/schemas/publicProduct";
import { PublicProductApiError } from "@/common/errors/publicProductApiError";
import {
  PublicProductDetailSchema,
  type PublicProductDetailVm,
} from "@/common/schemas/publicProductDetail";
import { publicGet } from "@/common/services/publicFetch";

const PUBLIC_PRODUCTS_PATH = "api/v1/product_service/public/products";
const PUBLIC_PRODUCT_FACETS_PATH = "api/v1/product_service/public/products/facets";

export interface GetPublicProductsParams {
  categoryId: number;
  page?: number;
  size?: number;
  q?: string;
  sort?: PublicProductSort;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface GetPublicProductFacetsParams {
  categoryId: number;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
}

export interface GetPublicProductDetailParams {
  productId: string;
}

function appendSearchParam(
  search: URLSearchParams,
  key: string,
  value: string | number | undefined
) {
  if (value === undefined) {
    return;
  }
  if (typeof value === "string" && value.trim() === "") {
    return;
  }
  search.set(key, String(value));
}

function appendRepeatedSearchParam(
  search: URLSearchParams,
  key: string,
  values: string[] | undefined
) {
  if (!values || values.length === 0) {
    return;
  }
  for (const value of values) {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      search.append(key, trimmed);
    }
  }
}

/**
 * Storefront PLP — GET /public/products (via Gateway).
 */
export async function getPublicProducts(
  params: GetPublicProductsParams
): Promise<PublicProductPageVm> {
  const search = new URLSearchParams();
  search.set("categoryId", String(params.categoryId));
  appendSearchParam(search, "page", params.page ?? 0);
  appendSearchParam(search, "size", params.size ?? 24);
  appendSearchParam(search, "q", params.q);
  appendSearchParam(search, "sort", params.sort ?? "newest");
  appendRepeatedSearchParam(search, "brands", params.brands);
  appendSearchParam(search, "minPrice", params.minPrice);
  appendSearchParam(search, "maxPrice", params.maxPrice);

  const url = `${PUBLIC_PRODUCTS_PATH}?${search.toString()}`;

  try {
    const response = await publicGet(url);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `getPublicProducts failed: ${response.status} ${response.statusText}`,
        errorBody
      );
      const message =
        response.status === 404
          ? "Category not found or not available."
          : "Failed to fetch public products.";
      throw new PublicProductApiError(message, response.status, errorBody);
    }

    const data = await response.json();
    const parsed = PublicProductPageSchema.safeParse(data);

    if (!parsed.success) {
      console.error("Public product page validation failed:", parsed.error);
      throw new Error("Invalid public product page response from API.");
    }

    return parsed.data;
  } catch (error) {
    console.error("getPublicProducts unexpected error:", error);
    throw error;
  }
}

/**
 * Storefront PLP facets — GET /public/products/facets (via Gateway).
 */
export async function getPublicProductFacets(
  params: GetPublicProductFacetsParams
): Promise<PublicProductFacetVm> {
  const search = new URLSearchParams();
  search.set("categoryId", String(params.categoryId));
  appendRepeatedSearchParam(search, "brands", params.brands);
  appendSearchParam(search, "minPrice", params.minPrice);
  appendSearchParam(search, "maxPrice", params.maxPrice);
  search.append("facet", "brand");
  search.append("facet", "price");

  const url = `${PUBLIC_PRODUCT_FACETS_PATH}?${search.toString()}`;

  try {
    const response = await publicGet(url);

    if (!response.ok) {
      const errorBody = await response.text();
      const message =
        response.status === 404
          ? "Category not found or not available."
          : "Failed to fetch public product facets.";
      throw new PublicProductApiError(message, response.status, errorBody);
    }

    const data = await response.json();
    const parsed = PublicProductFacetSchema.safeParse(data);

    if (!parsed.success) {
      console.error("Public product facets validation failed:", parsed.error);
      throw new Error("Invalid public product facets response from API.");
    }

    return parsed.data;
  } catch (error) {
    console.error("getPublicProductFacets unexpected error:", error);
    throw error;
  }
}

async function fetchPublicProductDetail(
  productId: string
): Promise<PublicProductDetailVm> {
  const normalizedProductId = productId.trim();
  const url = `${PUBLIC_PRODUCTS_PATH}/${normalizedProductId}`;

  const response = await publicGet(
    url,
    resolveStorefrontPublicGetInit({
      revalidate: STOREFRONT_PDP_REVALIDATE_SECONDS,
      tags: [`storefront-product:${normalizedProductId}`],
    })
  );

  if (!response.ok) {
    const errorBody = await response.text();
    const message =
      response.status === 404
        ? "Product not found or not available."
        : "Failed to fetch public product detail.";
    throw new PublicProductApiError(message, response.status, errorBody);
  }

  const data = await response.json();
  const parsed = PublicProductDetailSchema.safeParse(data);

  if (!parsed.success) {
    console.error("Public product detail validation failed:", parsed.error);
    throw new Error("Invalid public product detail response from API.");
  }

  return parsed.data;
}

const getPublicProductDetailCached = cache(fetchPublicProductDetail);

/**
 * Storefront PDP detail — GET /public/products/{productId} (via Gateway).
 * Dedupes metadata + page fetches per request; ISR revalidate matches backend TTL.
 */
export async function getPublicProductDetail(
  params: GetPublicProductDetailParams
): Promise<PublicProductDetailVm> {
  try {
    return await getPublicProductDetailCached(params.productId);
  } catch (error) {
    console.error("getPublicProductDetail unexpected error:", error);
    throw error;
  }
}
