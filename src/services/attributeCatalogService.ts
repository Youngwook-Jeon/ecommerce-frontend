"use server";

import { z } from "zod";
import { fetchWrapper } from "@/common/services/fetchWrapper";
import {
  AttributeDefinitionSchema,
  AttributeValueSchema,
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
