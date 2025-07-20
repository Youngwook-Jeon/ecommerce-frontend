"use server";

import { fetchWrapper } from "@/common/services/fetchWrapper";
import {CategorySchema, type CategoryDtoVm, CreateCategoryForm} from "@/common/schemas/category";
import {getErrorMessage} from "@/lib/utils";

/**
 * Fetches the category hierarchy from the backend and validates the response.
 * This is a server-side function.
 * @returns A promise that resolves to a validated array of root CategoryDtoVm objects.
 */
export async function getCategoryHierarchy(): Promise<CategoryDtoVm[]> {
  try {
    const response = await fetchWrapper.get(
      "api/v1/product_service/queries/categories/admin/hierarchy"
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Error fetching category hierarchy: ${response.status} ${response.statusText}`,
        errorBody
      );
      throw new Error("Failed to fetch category hierarchy.");
    }
    console.log("Category hierarchy response:", response);

    const data = await response.json();

    // Validate the data against the Zod schema
    // We expect an array of categories, so we use .array()
    const parsed = CategorySchema.array().safeParse(data);

    if (!parsed.success) {
      console.error(
        "Zod validation errors for category hierarchy:",
        parsed.error
      );
      throw new Error(
          "Invalid data format for category hierarchy received from API: " +
          JSON.stringify(parsed.error.issues)
      );

    }

    return parsed.data;
  } catch (error) {
    console.error(
      "An unexpected error occurred in getCategoryHierarchy:",
      error
    );
    return [];
  }
}

/**
 * Creates a new category.
 * @param data The data for the new category, conforming to CreateCategoryForm.
 * @returns A promise that resolves to the response from the server.
 */
export async function createCategory(data: CreateCategoryForm)
{
  try {
    const response = await fetchWrapper.post("api/v1/product_service/categories", data);

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || "Failed to create category.");
    }

    return { success: true, data: responseData };
  } catch (error: unknown) {
    console.error("An error occurred in createCategory Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}
