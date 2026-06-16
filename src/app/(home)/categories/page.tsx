import type { Metadata } from "next";

import Container from "@/components/global/Container";
import { CategoryTreeNav } from "@/modules/catalog/ui/components/CategoryTreeNav";
import { getPublicCategoryHierarchy } from "@/services/publicCategoryService";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse products by category",
};

export default async function CategoriesPage() {
  const categories = await getPublicCategoryHierarchy();

  return (
    <Container className="py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse products by category
        </p>
      </header>

      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No categories are available right now.
        </p>
      ) : (
        <CategoryTreeNav categories={categories} />
      )}
    </Container>
  );
}
