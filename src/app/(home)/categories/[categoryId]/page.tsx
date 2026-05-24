import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import Container from "@/components/global/Container";
import LoadingContainer from "@/components/global/LoadingContainer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { isPublicProductApiError } from "@/common/errors/publicProductApiError";
import { parsePlpSearchParams } from "@/modules/catalog/lib/plpSearchParams";
import { ProductGrid } from "@/modules/catalog/ui/components/ProductGrid";
import { ProductPagination } from "@/modules/catalog/ui/components/ProductPagination";
import { ProductSortSelect } from "@/modules/catalog/ui/components/ProductSortSelect";
import { getPublicProducts } from "@/services/publicProductService";

interface CategoryProductsPageProps {
  params: Promise<{ categoryId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function CategoryProductsPage({
  params,
  searchParams,
}: CategoryProductsPageProps) {
  const { categoryId: categoryIdRaw } = await params;
  const categoryId = Number(categoryIdRaw);

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const plpParams = parsePlpSearchParams(resolvedSearchParams);

  let productPage;
  try {
    productPage = await getPublicProducts({
      categoryId,
      page: plpParams.page,
      size: plpParams.size,
      q: plpParams.q,
      sort: plpParams.sort,
      brand: plpParams.brand,
      minPrice: plpParams.minPrice,
      maxPrice: plpParams.maxPrice,
    });
  } catch (error) {
    if (isPublicProductApiError(error) && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <Container className="py-10">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Category {categoryId}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Product List</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {productPage.totalElements.toLocaleString("en-US")} products
            {plpParams.q ? (
              <>
                {" "}
                · Search &quot;{plpParams.q}&quot;
              </>
            ) : null}
          </p>
        </div>
        <Suspense fallback={<LoadingContainer />}>
          <ProductSortSelect categoryId={categoryId} plpParams={plpParams} />
        </Suspense>
      </header>

      <ProductGrid products={productPage.content} />

      <ProductPagination
        categoryId={categoryId}
        plpParams={plpParams}
        page={productPage}
      />
    </Container>
  );
}
