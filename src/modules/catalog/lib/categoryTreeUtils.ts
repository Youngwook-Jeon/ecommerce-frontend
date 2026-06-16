import type { CategoryDtoVm } from "@/common/schemas/category";
import { STOREFRONT_NAV_CATEGORY_MAX_DEPTH } from "@/common/constants/storefrontCategory";

export function findCategoryById(
  categories: CategoryDtoVm[],
  id: number
): CategoryDtoVm | undefined {
  for (const category of categories) {
    if (category.id === id) {
      return category;
    }

    if (category.children.length > 0) {
      const found = findCategoryById(category.children, id);
      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

export function getCategoryBreadcrumbPath(
  categories: CategoryDtoVm[],
  id: number
): CategoryDtoVm[] {
  function search(
    nodes: CategoryDtoVm[],
    path: CategoryDtoVm[]
  ): CategoryDtoVm[] | null {
    for (const node of nodes) {
      const currentPath = [...path, node];

      if (node.id === id) {
        return currentPath;
      }

      const found = search(node.children, currentPath);
      if (found) {
        return found;
      }
    }

    return null;
  }

  return search(categories, []) ?? [];
}

/** True when a category has descendants beyond {@link STOREFRONT_NAV_CATEGORY_MAX_DEPTH}. */
export function hasNavHiddenDescendants(
  category: CategoryDtoVm,
  depth = 1
): boolean {
  if (category.children.length === 0) {
    return false;
  }

  if (depth >= STOREFRONT_NAV_CATEGORY_MAX_DEPTH) {
    return true;
  }

  return category.children.some((child) =>
    hasNavHiddenDescendants(child, depth + 1)
  );
}

/** True when this node is the deepest visible nav level and has hidden children. */
export function shouldShowNavSeeMoreLink(
  category: CategoryDtoVm,
  depth: number
): boolean {
  return (
    depth >= STOREFRONT_NAV_CATEGORY_MAX_DEPTH && category.children.length > 0
  );
}
