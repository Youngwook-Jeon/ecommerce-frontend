"use client";

import type {
  PublicProductFacetVm,
  PublicProductPageVm,
} from "@/common/schemas/publicProduct";
import type { PlpSearchParams } from "@/modules/catalog/lib/plpSearchParams";

import { ProductActiveFilterChips } from "./ProductActiveFilterChips";
import { ProductFilterSidebar } from "./ProductFilterSidebar";
import { ProductGrid } from "./ProductGrid";
import { ProductPagination } from "./ProductPagination";
import { ProductSortSelect } from "./ProductSortSelect";

interface ProductCatalogLayoutProps {
  categoryId: number;
  plpParams: PlpSearchParams;
  productPage: PublicProductPageVm;
  facetData: PublicProductFacetVm;
}

export function ProductCatalogLayout({
  categoryId,
  plpParams,
  productPage,
  facetData,
}: ProductCatalogLayoutProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(220px,260px)_1fr]">
      <ProductFilterSidebar
        categoryId={categoryId}
        plpParams={plpParams}
        facetData={facetData}
      />

      <div className="min-w-0">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">
              {productPage.content.length.toLocaleString("en-US")}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {productPage.totalElements.toLocaleString("en-US")}
            </span>{" "}
            results
          </p>
          <ProductSortSelect categoryId={categoryId} plpParams={plpParams} />
        </div>

        <ProductActiveFilterChips
          categoryId={categoryId}
          plpParams={plpParams}
        />

        <ProductGrid products={productPage.content} />

        <ProductPagination
          categoryId={categoryId}
          plpParams={plpParams}
          page={productPage}
        />
      </div>
    </div>
  );
}
