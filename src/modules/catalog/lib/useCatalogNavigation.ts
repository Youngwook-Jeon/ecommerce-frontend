"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  catalogProductsPath,
  clearPlpFilters,
  mergePlpParams,
  type PlpSearchParams,
} from "@/modules/catalog/lib/plpSearchParams";

export function useCatalogNavigation(
  categoryId: number | undefined,
  plpParams: PlpSearchParams
) {
  const router = useRouter();

  const applyParams = useCallback(
    (next: PlpSearchParams) => {
      router.replace(catalogProductsPath(categoryId, next), { scroll: false });
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
    applyParams(clearPlpFilters(plpParams));
  }, [applyParams, plpParams]);

  return { patchParams, clearFilters };
}
