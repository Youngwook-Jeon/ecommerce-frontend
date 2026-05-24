"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  categoryProductsPath,
  clearCategoryPlpFilters,
  mergePlpParams,
  type PlpSearchParams,
} from "@/modules/catalog/lib/plpSearchParams";

export function useCategoryPlpNavigation(
  categoryId: number,
  plpParams: PlpSearchParams
) {
  const router = useRouter();

  const applyParams = useCallback(
    (next: PlpSearchParams) => {
      router.replace(categoryProductsPath(categoryId, next), { scroll: false });
    },
    [categoryId, router]
  );

  const patchParams = useCallback(
    (patch: Partial<PlpSearchParams>) => {
      applyParams(mergePlpParams(plpParams, patch));
    },
    [applyParams, plpParams]
  );

  const clearFilters = useCallback(() => {
    applyParams(clearCategoryPlpFilters(plpParams));
  }, [applyParams, plpParams]);

  return { patchParams, clearFilters };
}
