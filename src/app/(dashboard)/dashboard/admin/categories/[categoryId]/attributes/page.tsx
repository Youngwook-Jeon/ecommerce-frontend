import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { CategoryDtoVm } from "@/common/schemas/category";
import { getCategoryAttributeWorkspace } from "@/services/attributeCatalogService";
import { CategoryAttributesClientPage } from "@/modules/dashboard/ui/components/admin/attributes/CategoryAttributesClientPage";
import { CatalogError } from "@/modules/dashboard/ui/components/admin/attributes/CatalogFeedback";

function categoryPath(categories: CategoryDtoVm[], id: number, ancestors: CategoryDtoVm[] = []): CategoryDtoVm[] | null {
  for (const category of categories) {
    const path = [...ancestors, category];
    if (category.id === id) return path;
    const found = categoryPath(category.children, id, path);
    if (found) return found;
  }
  return null;
}

export default async function CategoryAttributesPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  if (!/^\d+$/.test(categoryId)) notFound();
  const parsed = z.number().int().positive().safeParse(Number(categoryId));
  if (!parsed.success) notFound();
  const result = await getCategoryAttributeWorkspace(parsed.data);
  if (!result.success) return <CatalogError message={result.message} />;
  const path = categoryPath(result.data.categories, parsed.data);
  if (!path || path[path.length - 1].status === "DELETED") notFound();
  return (
    <div className="space-y-6">
      <header className="space-y-2"><nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link href="/dashboard/admin">Dashboard</Link> / <Link href="/dashboard/admin/categories">Categories</Link> / Attributes</nav><h1 className="text-2xl font-bold">Category Attributes</h1><p className="text-sm text-muted-foreground">{path.map((category) => category.name).join(" / ")}</p></header>
      <CategoryAttributesClientPage categoryId={parsed.data} policies={result.data.policies} definitions={result.data.definitions} />
    </div>
  );
}
