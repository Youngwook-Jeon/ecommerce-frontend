import { cache } from "react";

import { STOREFRONT_PDP_REVALIDATE_SECONDS, resolveStorefrontPublicGetInit } from "@/common/constants/storefrontCache";
import {
  PublicProductSearchSchema,
  type PublicProductSearchVm,
  type PublicProductSort,
} from "@/common/schemas/publicProduct";
import { PublicProductApiError } from "@/common/errors/publicProductApiError";
import {
  PublicProductDetailSchema,
  type PublicProductDetailVm,
} from "@/common/schemas/publicProductDetail";
import { publicGet } from "@/common/services/publicFetch";

const PUBLIC_PRODUCTS_PATH = "api/v1/product_service/public/products";
const PUBLIC_PRODUCT_SEARCH_PATH = `${PUBLIC_PRODUCTS_PATH}/search`;

export interface SearchPublicProductsParams {
  categoryId?: number;
  page?: number;
  size?: number;
  q?: string;
  sort?: PublicProductSort;
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

/** Cookie-free unified storefront search, including facets. */
export async function searchPublicProducts(
  params: SearchPublicProductsParams
): Promise<PublicProductSearchVm> {
  const search = new URLSearchParams();
  appendSearchParam(search, "categoryId", params.categoryId);
  appendSearchParam(search, "page", params.page ?? 0);
  appendSearchParam(search, "size", params.size ?? 24);
  appendSearchParam(search, "q", params.q);
  appendSearchParam(search, "sort", params.sort);
  appendRepeatedSearchParam(search, "brands", params.brands);
  appendSearchParam(search, "minPrice", params.minPrice);
  appendSearchParam(search, "maxPrice", params.maxPrice);

  let response: Response;
  try {
    response = await publicGet(`${PUBLIC_PRODUCT_SEARCH_PATH}?${search}`, { cache: "no-store" });
  } catch (error) {
    console.error("Product search connection failed:", error);
    throw new PublicProductApiError("Product search is temporarily unavailable.", 503);
  }
  if (!response.ok) {
    const body = await response.text();
    throw new PublicProductApiError("Failed to search products.", response.status, body);
  }
  const parsed = PublicProductSearchSchema.safeParse(await response.json());
  if (!parsed.success) {
    console.error("Public product search validation failed:", parsed.error);
    throw new Error("Invalid public product search response from API.");
  }
  return parsed.data;
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
