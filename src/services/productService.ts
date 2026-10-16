"use server";

import { z } from "zod";
import { fetchWrapper } from "../common/services/fetchWrapper";
import { getErrorMessage } from "@/lib/utils";
import type {
  ProductImageCommitResponseVm,
  ProductImagePresignResponseVm,
  ReadProductImageVm,
} from "@/types/productImage";

function withExpectedVersion(path: string, expectedVersion: number): string {
  if (!Number.isSafeInteger(expectedVersion) || expectedVersion < 1) {
    throw new Error("Reload the latest product before editing.");
  }
  return `${path}?expectedVersion=${expectedVersion}`;
}

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

export interface ProductOptionValueVm {
  productOptionValueId: string;
  optionValueId: string;
  priceDelta: number;
  isDefault: boolean;
  status: string;
  images?: ReadProductImageVm[];
}

export interface ProductOptionGroupVm {
  productOptionGroupId: string;
  optionGroupId: string;
  stepOrder: number;
  required: boolean;
  drivesVariantImages: boolean;
  status: string;
  optionValues: ProductOptionValueVm[];
}

export interface AdminProductDetailVm extends AdminProductDtoVm {
  version: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  optionGroups: ProductOptionGroupVm[];
  images?: ReadProductImageVm[];
}

export interface ProductVariantVm {
  productVariantId: string;
  sku: string;
  stockQuantity: number;
  status: string;
  calculatedPrice: number;
  mainImageUrl: string | null;
  selectedProductOptionValueIds: string[];
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

export async function getAdminProductDetail(
  productId: string
): Promise<AdminProductDetailVm | null> {
  try {
    const response = await fetchWrapper.get(
      `api/v1/product_service/admin/queries/products/${productId}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Error fetching admin product detail: ${response.status} ${response.statusText}`,
        errorBody
      );
      return null;
    }

    const data = await response.json();
    const version = z.number().int().positive().safe().parse(data.version);
    return { ...data, version } as AdminProductDetailVm;
  } catch (error) {
    console.error("Exception in getAdminProductDetail: ", error);
    return null;
  }
}

export async function getAdminProductVariants(
  productId: string
): Promise<ProductVariantVm[] | null> {
  try {
    const response = await fetchWrapper.get(
      `api/v1/product_service/admin/queries/products/${productId}/variants`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Error fetching admin product variants: ${response.status} ${response.statusText}`,
        errorBody
      );
      return null;
    }

    return (await response.json()) as ProductVariantVm[];
  } catch (error: unknown) {
    console.error("Exception in getAdminProductVariants:", error);
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
  /** When omitted, product-service uses a default placeholder until images are uploaded. */
  mainImageUrl?: string;
}

export interface CreateProductResponseVm {
  id: string;
  name: string;
  message: string;
}

export interface ProductImagePresignRequestBody {
  fileName: string;
  contentType: string;
  contentLength: number;
  role: "MAIN" | "GALLERY";
  sortOrder: number;
}

export interface ProductImageCommitRequestBody {
  objectKey: string;
  contentType: string;
  fileSize: number;
  role: "MAIN" | "GALLERY";
  sortOrder: number;
}

export interface ProductImageReorderRequestBody {
  orderedImageIds: string[];
}

export interface ProductImageReorderResponseVm {
  productId: string;
  reorderedCount: number;
  orderedImageIds: string[];
  message?: string;
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

export interface AddProductOptionValueRequest {
  optionValueId: string;
  priceDelta: number;
  isDefault?: boolean;
}

export interface AddProductOptionGroupRequest {
  optionGroupId: string;
  stepOrder?: number;
  required: boolean;
  optionValues: AddProductOptionValueRequest[];
}

export interface AddProductOptionValuesRequest {
  optionValues: AddProductOptionValueRequest[];
}

export interface AddProductVariantRequest {
  stockQuantity: number;
  selectedProductOptionValueIds: string[];
}

export interface AddProductVariantsRequest {
  variants: AddProductVariantRequest[];
}

export interface UpdateProductVariantRequest {
  stockQuantity?: number;
  status?: string;
}

export async function createProduct(data: CreateProductRequest) {
  const requestBody: Record<string, unknown> = { ...data };
  delete requestBody.status;
  if (data.mainImageUrl != null && data.mainImageUrl !== "") {
    requestBody.mainImageUrl = data.mainImageUrl;
  }

  try {
    const response = await fetchWrapper.post(
      "api/v1/product_service/admin/products",
      requestBody
    );

    const responseData = (await response.json()) as CreateProductResponseVm & {
      message?: string;
    };

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to create product.");
    }

    return { success: true as const, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in createProduct Server Action:", error);
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function updateProduct(
  productId: string,
  data: UpdateProductRequest,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.put(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}`, expectedVersion),
      data
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

export async function requestProductImageUploadUrl(
  productId: string,
  payload: ProductImagePresignRequestBody
) {
  try {
    const response = await fetchWrapper.post(
      `api/v1/product_service/admin/products/${productId}/images/presign-upload`,
      payload
    );
    const responseData = (await response.json()) as ProductImagePresignResponseVm & {
      message?: string;
    };
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to request upload URL.");
    }
    return { success: true as const, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in requestProductImageUploadUrl:", error);
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function commitProductImage(
  productId: string,
  payload: ProductImageCommitRequestBody,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.post(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}/images/commit`, expectedVersion),
      payload
    );
    const responseData = (await response.json()) as ProductImageCommitResponseVm & {
      message?: string;
    };
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to commit uploaded image.");
    }
    return { success: true as const, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in commitProductImage:", error);
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function deleteProductImage(productId: string, imageId: string,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.del(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}/images/${imageId}`, expectedVersion)
    );
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null) as { message?: string } | null;
      throw new Error(errorBody?.message || "Failed to delete product image.");
    }
    return { success: true as const };
  } catch (error: unknown) {
    console.error("An error occurred in deleteProductImage:", error);
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function reorderProductImages(
  productId: string,
  payload: ProductImageReorderRequestBody,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.patch(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}/images/reorder`, expectedVersion),
      payload
    );
    const responseData = (await response.json()) as ProductImageReorderResponseVm & {
      message?: string;
    };
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to reorder product images.");
    }
    return { success: true as const, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in reorderProductImages:", error);
    return { success: false as const, message: getErrorMessage(error) };
  }
}

function optionValueImagesBase(productId: string, productOptionValueId: string) {
  return `api/v1/product_service/admin/products/${productId}/option-values/${productOptionValueId}/images`;
}

export async function requestOptionValueImageUploadUrl(
  productId: string,
  productOptionValueId: string,
  payload: ProductImagePresignRequestBody
) {
  try {
    const response = await fetchWrapper.post(
      `${optionValueImagesBase(productId, productOptionValueId)}/presign-upload`,
      payload
    );
    const responseData = (await response.json()) as ProductImagePresignResponseVm & {
      message?: string;
    };
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to request upload URL.");
    }
    return { success: true as const, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in requestOptionValueImageUploadUrl:", error);
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function commitOptionValueImage(
  productId: string,
  productOptionValueId: string,
  payload: ProductImageCommitRequestBody,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.post(
      withExpectedVersion(`${optionValueImagesBase(productId, productOptionValueId)}/commit`, expectedVersion),
      payload
    );
    const responseData = (await response.json()) as ProductImageCommitResponseVm & {
      message?: string;
    };
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to commit uploaded image.");
    }
    return { success: true as const, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in commitOptionValueImage:", error);
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function deleteOptionValueImage(
  productId: string,
  productOptionValueId: string,
  imageId: string,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.del(
      withExpectedVersion(`${optionValueImagesBase(productId, productOptionValueId)}/${imageId}`, expectedVersion)
    );
    if (!response.ok) {
      const errorBody = await response.json().catch(() => null) as { message?: string } | null;
      throw new Error(errorBody?.message || "Failed to delete option value image.");
    }
    return { success: true as const };
  } catch (error: unknown) {
    console.error("An error occurred in deleteOptionValueImage:", error);
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function reorderOptionValueImages(
  productId: string,
  productOptionValueId: string,
  payload: ProductImageReorderRequestBody,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.patch(
      withExpectedVersion(`${optionValueImagesBase(productId, productOptionValueId)}/reorder`, expectedVersion),
      payload
    );
    const responseData = (await response.json()) as ProductImageReorderResponseVm & {
      message?: string;
    };
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to reorder option value images.");
    }
    return { success: true as const, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in reorderOptionValueImages:", error);
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function updateProductOptionGroupVisual(
  productId: string,
  productOptionGroupId: string,
  drivesVariantImages: boolean,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.patch(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}/option-groups/${productOptionGroupId}/visual`, expectedVersion),
      { drivesVariantImages }
    );
    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to update visual option group.");
    }
    return { success: true as const, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in updateProductOptionGroupVisual:", error);
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function updateProductStatus(
  productId: string,
  data: UpdateProductStatusRequest,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.patch(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}/status`, expectedVersion),
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

export async function deleteProduct(productId: string,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.del(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}`, expectedVersion)
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

export async function addProductOptionGroup(
  productId: string,
  payload: AddProductOptionGroupRequest,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.post(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}/option-groups`, expectedVersion),
      payload
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to add product option group.");
    }

    return { success: true, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in addProductOptionGroup Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function addProductOptionValues(
  productId: string,
  productOptionGroupId: string,
  payload: AddProductOptionValuesRequest,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.post(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}/option-groups/${productOptionGroupId}/option-values`, expectedVersion),
      payload
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to add product option values.");
    }

    return { success: true, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in addProductOptionValues Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function deleteProductOptionGroup(
  productId: string,
  productOptionGroupId: string,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.del(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}/option-groups/${productOptionGroupId}`, expectedVersion)
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to delete product option group.");
    }
    return { success: true, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in deleteProductOptionGroup Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function deleteProductOptionValue(
  productId: string,
  productOptionValueId: string,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.del(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}/option-values/${productOptionValueId}`, expectedVersion)
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to delete product option value.");
    }
    return { success: true, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in deleteProductOptionValue Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function changeProductOptionGroupStepOrder(
  productId: string,
  productOptionGroupId: string,
  stepOrder: number,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.patch(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}/option-groups/${productOptionGroupId}/step-order`, expectedVersion),
      { stepOrder }
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(
        responseData.message || "Failed to update product option group step order."
      );
    }
    return { success: true, data: responseData };
  } catch (error: unknown) {
    console.error(
      "An error occurred in changeProductOptionGroupStepOrder Server Action:",
      error
    );
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function reorderProductOptionGroups(
  productId: string,
  orderedProductOptionGroupIds: string[],
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.patch(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}/option-groups/reorder`, expectedVersion),
      { orderedProductOptionGroupIds }
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to reorder product option groups.");
    }
    return { success: true, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in reorderProductOptionGroups Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function addProductVariants(
  productId: string,
  payload: AddProductVariantsRequest,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.post(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}/variants`, expectedVersion),
      payload
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to add product variants.");
    }

    return { success: true, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in addProductVariants Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function updateProductVariant(
  productId: string,
  productVariantId: string,
  payload: UpdateProductVariantRequest,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.patch(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}/variants/${productVariantId}`, expectedVersion),
      payload
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to update product variant.");
    }

    return { success: true, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in updateProductVariant Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function deleteProductVariant(productId: string, productVariantId: string,
  expectedVersion: number
) {
  try {
    const response = await fetchWrapper.del(
      withExpectedVersion(`api/v1/product_service/admin/products/${productId}/variants/${productVariantId}`, expectedVersion)
    );

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.message || "Failed to delete product variant.");
    }

    return { success: true, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in deleteProductVariant Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}

