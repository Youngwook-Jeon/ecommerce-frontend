import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { CategoryDtoVm } from "@/common/schemas/category";

interface CategoryTreeNavProps {
  categories: CategoryDtoVm[];
  depth?: number;
}

export function CategoryTreeNav({
  categories,
  depth = 0,
}: CategoryTreeNavProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <ul
      className={
        depth === 0 ? "space-y-1" : "mt-1 ml-2 space-y-1 border-l pl-4"
      }
      role="tree"
      aria-label={depth === 0 ? "Category tree" : undefined}
    >
      {categories.map((category) => (
        <li key={category.id} role="treeitem" aria-expanded="true">
          <div className="flex items-center gap-2 py-1">
            {depth > 0 ? (
              <ChevronRight
                className="h-3 w-3 shrink-0 text-muted-foreground"
                aria-hidden
              />
            ) : null}
            <Link
              href={`/categories/${category.id}`}
              className="text-sm font-medium hover:text-primary hover:underline"
            >
              {category.name}
            </Link>
          </div>
          {category.children.length > 0 ? (
            <CategoryTreeNav
              categories={category.children}
              depth={depth + 1}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}
