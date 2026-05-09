import type { ReadProductImageVm } from "@/types/productImage";

export type { ReadProductImageVm };

export interface AdminProductDetailVm {
    id: string;
    categoryId: number | null;
    name: string;
    description: string;
    brand: string;
    mainImageUrl: string | null;
    basePrice: number;
    status: string;
    conditionType: string;
    createdAt: string;
    updatedAt: string;
    images?: ReadProductImageVm[];
}

export async function fetchAdminProductDetail(
    productId: string
): Promise<AdminProductDetailVm> {
    const res = await fetch(
        `/api/v1/product_service/admin/queries/products/${productId}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
            `Failed to fetch product detail: ${res.status} ${res.statusText} ${text}`
        );
    }

    return (await res.json()) as AdminProductDetailVm;
}