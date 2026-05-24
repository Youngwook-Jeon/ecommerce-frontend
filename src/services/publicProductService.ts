"use server";

import {
  PublicProductPageSchema,
  type PublicProductPageVm,
  type PublicProductSort,
} from "@/common/schemas/publicProduct";
import { PublicProductApiError } from "@/common/errors/publicProductApiError";
import { fetchWrapper } from "@/common/services/fetchWrapper";

const PUBLIC_PRODUCTS_PATH = "api/v1/product_service/public/products";

export interface GetPublicProductsParams {
  categoryId: number;
  page?: number;
  size?: number;
  q?: string;
  sort?: PublicProductSort;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
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
  appendSearchParam(search, "brand", params.brand);
  appendSearchParam(search, "minPrice", params.minPrice);
  appendSearchParam(search, "maxPrice", params.maxPrice);

  const url = `${PUBLIC_PRODUCTS_PATH}?${search.toString()}`;

  try {
    const response = await fetchWrapper.get(url);

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
