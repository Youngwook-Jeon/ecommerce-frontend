"use server";

import { fetchWrapper } from "@/common/services/fetchWrapper";
import {
  AddOptionValuesForm,
  OptionGroupListSchema,
  OptionGroupVm,
  UpdateOptionGroupForm,
  UpdateOptionValueForm,
  CreateOptionGroupForm,
} from "@/common/schemas/optionGroup";
import { getErrorMessage } from "@/lib/utils";

export async function getAdminOptionGroups(): Promise<OptionGroupVm[]> {
  try {
    const response = await fetchWrapper.get(
      "api/v1/product_service/admin/queries/option-groups",
      { cache: "no-store" }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Error fetching option groups: ${response.status} ${response.statusText}`,
        errorBody
      );
      return [];
    }

    const data = await response.json();
    const parsed = OptionGroupListSchema.safeParse(data);
    if (!parsed.success) {
      console.error("Invalid option group payload:", parsed.error.issues);
      return [];
    }

    return parsed.data.optionGroups;
  } catch (error) {
    console.error("An unexpected error occurred in getAdminOptionGroups:", error);
    return [];
  }
}

export async function createOptionGroup(payload: CreateOptionGroupForm) {
  try {
    const response = await fetchWrapper.post(
      "api/v1/product_service/option-groups",
      payload
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to create option group.");
    }
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function updateOptionGroup(
  groupId: string,
  payload: UpdateOptionGroupForm
) {
  try {
    const response = await fetchWrapper.put(
      `api/v1/product_service/option-groups/${groupId}`,
      payload
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update option group.");
    }
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function deleteOptionGroup(groupId: string) {
  try {
    const response = await fetchWrapper.del(
      `api/v1/product_service/option-groups/${groupId}`
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete option group.");
    }
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function addOptionValues(groupId: string, payload: AddOptionValuesForm) {
  try {
    const response = await fetchWrapper.post(
      `api/v1/product_service/option-groups/${groupId}/option-values`,
      payload
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to add option values.");
    }
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function updateOptionValue(
  groupId: string,
  valueId: string,
  payload: UpdateOptionValueForm
) {
  try {
    const response = await fetchWrapper.put(
      `api/v1/product_service/option-groups/${groupId}/option-values/${valueId}`,
      payload
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to update option value.");
    }
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function deleteOptionValue(groupId: string, valueId: string) {
  try {
    const response = await fetchWrapper.del(
      `api/v1/product_service/option-groups/${groupId}/option-values/${valueId}`
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete option value.");
    }
    return { success: true, data };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
}
