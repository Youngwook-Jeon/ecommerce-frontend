"use server";

import {revalidatePath} from "next/cache";

import { fetchWrapper } from "@/common/services/fetchWrapper";
import {CategorySchema, type CategoryDtoVm, CreateCategoryForm, UpdateCategorySchema} from "@/common/schemas/category";
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

/**
 * Updates an existing category.
 */
export async function updateCategory(id: number, data: CreateCategoryForm) {
  try {
    const validatedData = UpdateCategorySchema.parse(data);
    const response = await fetchWrapper.put(`api/v1/product_service/categories/${id}`, validatedData);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update category.");
    }

    revalidatePath("/dashboard/admin/categories");
    return { success: true, data: await response.json() };
  } catch (error: unknown) {
    console.error("An error occurred in updateCategory Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}

/**
 * Deletes a category.
 */
export async function deleteCategory(id: number) {
  try {
    const response = await fetchWrapper.del(`api/v1/product_service/categories/${id}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete category.");
    }

    revalidatePath("/dashboard/admin/categories");
    return { success: true, data: await response.json() };
  } catch (error: unknown) {
    console.error("An error occurred in deleteCategory Server Action:", error);
    return { success: false, message: getErrorMessage(error) };
  }
}
