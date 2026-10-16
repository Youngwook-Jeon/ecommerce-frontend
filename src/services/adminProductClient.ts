import { z } from "zod";
import type { ReadProductImageVm } from "@/types/productImage";

export type { ReadProductImageVm };

export interface AdminProductDetailVm {
    id: string;
    version: number;
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

    const data = await res.json();
    const version = z.number().int().positive().safe().parse(data.version);
    return { ...data, version } as AdminProductDetailVm;
}