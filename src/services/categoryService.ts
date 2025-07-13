import { fetchWrapper } from "@/common/services/fetchWrapper";
import { CategorySchema, type CategoryDtoVm } from "@/common/schemas/category";

/**
 * Fetches the category hierarchy from the backend and validates the response.
 * This is a server-side function.
 * @returns A promise that resolves to a validated array of root CategoryDtoVm objects.
 */
export async function getCategoryHierarchy(): Promise<CategoryDtoVm[]> {
  try {
    const response = await fetchWrapper.get(
      "api/v1/product_service/queries/categories/admin/hierarchy"
      //   "api/v1/product_service/queries/categories/hierarchy"
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
        "Invalid data format for category hierarchy received from API."
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
