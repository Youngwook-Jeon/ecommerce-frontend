import { cache } from "react";
import { z } from "zod";

import { STOREFRONT_CATEGORY_REVALIDATE_SECONDS, resolveStorefrontPublicGetInit } from "@/common/constants/storefrontCache";
import { CategorySchema, type CategoryDtoVm } from "@/common/schemas/category";
import { publicGet } from "@/common/services/publicFetch";

const PUBLIC_CATEGORY_HIERARCHY_PATH =
  "api/v1/product_service/queries/categories/hierarchy";

const PublicCategoryHierarchySchema = z.object({
  categories: z.array(CategorySchema),
});

const fetchPublicCategoryHierarchy = cache(
  async (): Promise<CategoryDtoVm[]> => {
    const response = await publicGet(
      PUBLIC_CATEGORY_HIERARCHY_PATH,
      resolveStorefrontPublicGetInit({
        revalidate: STOREFRONT_CATEGORY_REVALIDATE_SECONDS,
        tags: ["storefront-categories"],
      })
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch category hierarchy: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const parsed = PublicCategoryHierarchySchema.safeParse(data);

    if (!parsed.success) {
      throw new Error(
        `Invalid category hierarchy response: ${JSON.stringify(parsed.error.issues)}`
      );
    }

    return parsed.data.categories;
  }
);

export async function getPublicCategoryHierarchy(): Promise<CategoryDtoVm[]> {
  return fetchPublicCategoryHierarchy();
}
