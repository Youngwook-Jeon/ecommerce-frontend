"use client";

import Link from "next/link";

import type { PublicProductSearchVm } from "@/common/schemas/publicProduct";
import { Button } from "@/components/ui/button";
import {
  catalogProductsPath,
  MAX_SEARCH_WINDOW,
  type PlpSearchParams,
} from "@/modules/catalog/lib/plpSearchParams";

interface ProductPaginationProps {
  categoryId?: number;
  plpParams: PlpSearchParams;
  page: PublicProductSearchVm;
}

export function ProductPagination({
  categoryId,
  plpParams,
  page,
}: ProductPaginationProps) {
  if (page.totalPages <= 1) {
    return null;
  }

  const currentUrlPage = plpParams.page + 1;
  const prevParams: PlpSearchParams = {
    ...plpParams,
    page: Math.max(0, plpParams.page - 1),
  };
  const nextParams: PlpSearchParams = {
    ...plpParams,
    page: plpParams.page + 1,
  };

  const hasPrev = currentUrlPage > 1;
  const accessiblePages = Math.min(page.totalPages, Math.floor(MAX_SEARCH_WINDOW / page.size));
  const hasNext = currentUrlPage < accessiblePages;

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-4"
      aria-label="Product list pagination"
    >
      {hasPrev ? (
        <Button variant="outline" asChild>
          <Link href={catalogProductsPath(categoryId, prevParams)}>Previous</Link>
        </Button>
      ) : (
        <Button variant="outline" disabled>
          Previous
        </Button>
      )}
      <span className="text-sm text-muted-foreground">
        {currentUrlPage} / {accessiblePages}
      </span>
      {hasNext ? (
        <Button variant="outline" asChild>
          <Link href={catalogProductsPath(categoryId, nextParams)}>Next</Link>
        </Button>
      ) : (
        <Button variant="outline" disabled>
          Next
        </Button>
      )}
    </nav>
  );
}
