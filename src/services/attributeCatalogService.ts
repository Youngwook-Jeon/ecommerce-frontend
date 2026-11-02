"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { CategorySchema } from "@/common/schemas/category";
import { fetchWrapper } from "@/common/services/fetchWrapper";
import {
  AttributeDefinitionSchema,
  AttributeValueSchema,
  AttributeNameSchema,
  AttributeValueFormValues,
  CategoryAttributePolicyInput,
  CategoryAttributePolicySchema,
  CategoryAttributeSchema,
  CreateAttributeFormValues,
  CreateAttributeSchema,
  toAttributeValueRequest,
} from "@/common/schemas/attributeCatalog";
import { getErrorMessage } from "@/lib/utils";

async function readCatalog(path: string) {
  const response = await fetchWrapper.get(`api/v1/product_service/admin/attributes${path}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "Failed to load the attribute catalog.");
  }
  return response.json();
}

export async function getAttributeDefinitions() {
  try {
    const data = z.array(AttributeDefinitionSchema).parse(await readCatalog(""));
    return { success: true as const, data };
  } catch (error: unknown) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function getAttributeValueChoices(attributeId: string) {
  try {
    const id = z.string().uuid().parse(attributeId);
    const [definitionPayload, valuesPayload] = await Promise.all([
      readCatalog(`/${id}`),
      readCatalog(`/${id}/values`),
    ]);
    const definition = AttributeDefinitionSchema.parse(definitionPayload);
    const values = z.array(AttributeValueSchema).parse(valuesPayload);
    if (definition.id !== id || values.some((value) => value.attributeId !== id)) {
      throw new Error("The attribute catalog returned values for a different attribute.");
    }
    return { success: true as const, data: { definition, values } };
  } catch (error: unknown) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

async function writeCatalog(
  method: "post" | "put" | "del",
  path: string,
  body?: object
) {
  const url = `api/v1/product_service/admin/${path}`;
  const response = method === "del" ? await fetchWrapper.del(url) : await fetchWrapper[method](url, body);
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message || "Failed to update the attribute catalog.");
  }
  revalidatePath("/dashboard/admin", "layout");
  return response.status === 204 ? null : response.json();
}

export async function createAttribute(input: CreateAttributeFormValues) {
  try {
    const value = CreateAttributeSchema.parse(input);
    const data = AttributeDefinitionSchema.parse(await writeCatalog("post", "attributes", {
      ...value, canonicalUnit: value.canonicalUnit || null,
    }));
    return { success: true as const, data };
  } catch (error: unknown) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function renameAttribute(attributeId: string, input: { displayName: string }) {
  try {
    const id = z.string().uuid().parse(attributeId);
    await writeCatalog("put", `attributes/${id}`, AttributeNameSchema.parse(input));
    return { success: true as const };
  } catch (error: unknown) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function deactivateAttribute(attributeId: string) {
  try {
    const id = z.string().uuid().parse(attributeId);
    await writeCatalog("post", `attributes/${id}/deactivate`, {});
    return { success: true as const };
  } catch (error: unknown) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function deleteAttribute(attributeId: string) {
  try {
    const id = z.string().uuid().parse(attributeId);
    await writeCatalog("del", `attributes/${id}`);
    return { success: true as const };
  } catch (error: unknown) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function createAttributeValue(attributeId: string, input: AttributeValueFormValues) {
  try {
    const id = z.string().uuid().parse(attributeId);
    // The API verifies the definition's current type and active status again.
    await writeCatalog("post", `attributes/${id}/values`, toAttributeValueRequest(input));
    return { success: true as const };
  } catch (error: unknown) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function renameAttributeValue(attributeId: string, valueId: string, input: { displayName: string }) {
  try {
    const id = z.string().uuid().parse(attributeId);
    const selectedId = z.string().uuid().parse(valueId);
    await writeCatalog("put", `attributes/${id}/values/${selectedId}`, AttributeNameSchema.parse(input));
    return { success: true as const };
  } catch (error: unknown) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function deleteAttributeValue(attributeId: string, valueId: string) {
  try {
    const id = z.string().uuid().parse(attributeId);
    const selectedId = z.string().uuid().parse(valueId);
    await writeCatalog("del", `attributes/${id}/values/${selectedId}`);
    return { success: true as const };
  } catch (error: unknown) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function getCategoryAttributeWorkspace(categoryId: number) {
  try {
    const id = z.number().int().positive().parse(categoryId);
    const [policyResponse, hierarchyResponse, definitionsPayload] = await Promise.all([
      fetchWrapper.get(`api/v1/product_service/admin/categories/${id}/attributes`, { cache: "no-store" }),
      fetchWrapper.get("api/v1/product_service/queries/categories/admin/hierarchy", { cache: "no-store" }),
      readCatalog(""),
    ]);
    if (!policyResponse.ok || !hierarchyResponse.ok) {
      throw new Error("Failed to load the category attribute policies. Check that the category exists and try again.");
    }
    const policies = z.array(CategoryAttributeSchema).parse(await policyResponse.json());
    const hierarchy = z.object({ categories: z.array(CategorySchema) }).parse(await hierarchyResponse.json());
    const definitions = z.array(AttributeDefinitionSchema).parse(definitionsPayload);
    return { success: true as const, data: { policies, categories: hierarchy.categories, definitions } };
  } catch (error: unknown) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function setCategoryAttributePolicy(categoryId: number, attributeId: string, input: CategoryAttributePolicyInput) {
  try {
    const id = z.number().int().positive().parse(categoryId);
    const attribute = z.string().uuid().parse(attributeId);
    await writeCatalog("put", `categories/${id}/attributes/${attribute}`, CategoryAttributePolicySchema.parse(input));
    return { success: true as const };
  } catch (error: unknown) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}

export async function removeCategoryAttributePolicy(categoryId: number, attributeId: string) {
  try {
    const id = z.number().int().positive().parse(categoryId);
    const attribute = z.string().uuid().parse(attributeId);
    await writeCatalog("del", `categories/${id}/attributes/${attribute}`);
    return { success: true as const };
  } catch (error: unknown) {
    return { success: false as const, message: getErrorMessage(error) };
  }
}
