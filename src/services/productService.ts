"use server";

import { fetchWrapper } from "../common/services/fetchWrapper";
import { getErrorMessage } from "@/lib/utils";

// ----- 어드민용 제품 조회 API -----
export interface AdminProductDtoVm {
  id: string;
  categoryId: number | null;
  name: string;
  brand: string;
  mainImageUrl: string | null;
  basePrice: number;
  status: string;
  conditionType: string;
}

export interface AdminProductPageVm {
  content: AdminProductDtoVm[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface AdminProductSearchParams {
  page?: number;
  size?: number;
  sort?: string;
  categoryId?: number;
  includeOrphans?: boolean;
  status?: string;
  brand?: string;
  keyword?: string;
}

export async function getAdminProducts(
  params: AdminProductSearchParams = {}
): Promise<AdminProductPageVm | null> {
  const {
    page = 0,
    size = 20,
    sort = "createdAt,desc",
    categoryId,
    includeOrphans = true,
    status,
    brand,
    keyword,
  } = params;

  const searchParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort,
    includeOrphans: includeOrphans.toString(),
  });

  if (categoryId != null) searchParams.append("categoryId", categoryId.toString());
  if (status) searchParams.append("status", status);
  if (brand) searchParams.append("brand", brand);
  if (keyword) searchParams.append("keyword", keyword);

  try {
    const response = await fetchWrapper.get(
      `api/v1/product_service/admin/queries/products?${searchParams.toString()}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Error fetching admin products: ${response.status} ${response.statusText}`,
        errorBody
      );
      return null;
    }

    return (await response.json()) as AdminProductPageVm;
  } catch (error) {
    console.error("Exception in getAdminProducts: ", error);
    return null;
  }
}

// ----- 어드민용 제품 CUD API -----

export interface CreateProductRequest {
  name: string;
  description: string;
  basePrice: number;
  brand: string;
  categoryId: number;
  conditionType: string;
  status: string;
}

export interface UpdateProductRequest {
  name: string;
  description: string;
  basePrice: number;
  brand: string;
  categoryId: number;
}

export interface UpdateProductStatusRequest {
  status: string;
}

export async function createProduct(data: CreateProductRequest) {
  const requestBody = {
    ...data,
    mainImageUrl: "https://example.com/images/default-product.jpg",
  };

  try {
    const response = await fetchWrapper.post(
      "api/v1/product_service/admin/products",
      requestBody
    );

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to create product.");
    }

    return { success: true, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in createProduct Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function updateProduct(
  productId: string,
  data: UpdateProductRequest
) {
  const requestBody = {
    ...data,
    mainImageUrl: "https://example.com/images/default-product.jpg",
  };

  try {
    const response = await fetchWrapper.put(
      `api/v1/product_service/admin/products/${productId}`,
      requestBody
    );

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to update product.");
    }

    return { success: true, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in updateProduct Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function updateProductStatus(
  productId: string,
  data: UpdateProductStatusRequest
) {
  try {
    const response = await fetchWrapper.patch(
      `api/v1/product_service/admin/products/${productId}/status`,
      data
    );

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to update product status.");
    }

    return { success: true, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in updateProductStatus Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const response = await fetchWrapper.del(
      `api/v1/product_service/admin/products/${productId}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete product.");
    }

    return { success: true, data: await response.json() };
  } catch (error: unknown) {
    console.error("An error occurred in deleteProduct Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}

