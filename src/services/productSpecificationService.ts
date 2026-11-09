"use server";

import {z} from "zod";
import {revalidatePath} from "next/cache";
import {fetchWrapper} from "@/common/services/fetchWrapper";
import {ProductSpecificationsSchema} from "@/common/schemas/productSpecification";
import {CategoryAttributeSchema} from "@/common/schemas/attributeCatalog";
import {getErrorMessage} from "@/lib/utils";

const ProductIdSchema = z.string().uuid();
const VersionSchema = z.number().int().positive().safe();
const base = "api/v1/product_service/admin/products";

export async function getProductSpecificationWorkspace(productId: string, categoryId: number | null) {
    try {
        const id = ProductIdSchema.parse(productId);
        const category = z.number().int().positive().nullable().parse(categoryId);
        const [specificationsResponse, policiesResponse] = await Promise.all([
            fetchWrapper.get(`${base}/${id}/specifications`, {cache: "no-store"}),
            category === null ? Promise.resolve(null) : fetchWrapper.get(
                `api/v1/product_service/admin/categories/${category}/attributes`, {cache: "no-store"}
            ),
        ]);
        if (!specificationsResponse.ok || (policiesResponse && !policiesResponse.ok)) {
            throw new Error("Failed to load product specifications or category policies.");
        }
        const specifications = ProductSpecificationsSchema.parse(await specificationsResponse.json());
        if (specifications.productId !== id) throw new Error("The specifications belong to a different product.");
        const policies = policiesResponse ? z.array(CategoryAttributeSchema).parse(await policiesResponse.json()) : [];
        return {success: true as const, data: {...specifications, policies}};
    } catch (error: unknown) {
        return {success: false as const, message: getErrorMessage(error)};
    }
}

async function mutateSpecification(productId: string, attributeId: string, expectedVersion: number, valueId?: string) {
    const id = ProductIdSchema.parse(productId);
    const attribute = z.string().uuid().parse(attributeId);
    const version = VersionSchema.parse(expectedVersion);
    const path = `${base}/${id}/specifications/${attribute}?expectedVersion=${version}`;
    const response = valueId === undefined ? await fetchWrapper.del(path) : await fetchWrapper.put(path, {
        attributeValueId: z.string().uuid().parse(valueId),
    });
    if (!response.ok) {
        const body = await response.json().catch(() => null);
        return {
            success: false as const, conflict: response.status === 409,
            message: body?.message || "Failed to update the product specification."
        };
    }
    revalidatePath("/dashboard/admin/products");
    return {success: true as const};
}

export async function setProductSpecification(productId: string, attributeId: string, attributeValueId: string, expectedVersion: number) {
    try {
        return await mutateSpecification(productId, attributeId, expectedVersion, attributeValueId);
    } catch (error: unknown) {
        return {success: false as const, conflict: false, message: getErrorMessage(error)};
    }
}

export async function removeProductSpecification(productId: string, attributeId: string, expectedVersion: number) {
    try {
        return await mutateSpecification(productId, attributeId, expectedVersion);
    } catch (error: unknown) {
        return {success: false as const, conflict: false, message: getErrorMessage(error)};
    }
}
