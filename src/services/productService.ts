"use server";

import { fetchWrapper } from "../common/services/fetchWrapper";

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

