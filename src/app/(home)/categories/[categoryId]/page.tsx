import Link from "next/link";
import { notFound } from "next/navigation";

import Container from "@/components/global/Container";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { isPublicProductApiError } from "@/common/errors/publicProductApiError";
import {
  hasActiveCategoryFilters,
  parsePlpSearchParams,
} from "@/modules/catalog/lib/plpSearchParams";
import { getCategoryBreadcrumbPath } from "@/modules/catalog/lib/categoryTreeUtils";
import { ProductCatalogLayout } from "@/modules/catalog/ui/components/ProductCatalogLayout";
import {
  getPublicProductFacets,
  getPublicProducts,
} from "@/services/publicProductService";
import { getPublicCategoryHierarchy } from "@/services/publicCategoryService";

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
  let facetData;
  let categoryHierarchy;
  try {
    [productPage, facetData, categoryHierarchy] = await Promise.all([
      getPublicProducts({
        categoryId,
        page: plpParams.page,
        size: plpParams.size,
        sort: plpParams.sort,
        brands: plpParams.brands,
        minPrice: plpParams.minPrice,
        maxPrice: plpParams.maxPrice,
      }),
      getPublicProductFacets({
        categoryId,
        brands: plpParams.brands,
        minPrice: plpParams.minPrice,
        maxPrice: plpParams.maxPrice,
      }),
      getPublicCategoryHierarchy(),
    ]);
  } catch (error) {
    if (isPublicProductApiError(error) && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const breadcrumbPath = getCategoryBreadcrumbPath(categoryHierarchy, categoryId);
  const categoryName =
    breadcrumbPath.at(-1)?.name ?? `Category ${categoryId}`;

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
            <BreadcrumbLink asChild>
              <Link href="/categories">Categories</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {breadcrumbPath.map((category, index) => {
            const isLast = index === breadcrumbPath.length - 1;

            return (
              <span key={category.id} className="contents">
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage>{category.name}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={`/categories/${category.id}`}>
                        {category.name}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{categoryName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {productPage.totalElements.toLocaleString("en-US")} products
          {hasActiveCategoryFilters(plpParams) ? " · filtered" : ""}
        </p>
      </header>

      <ProductCatalogLayout
        categoryId={categoryId}
        plpParams={plpParams}
        productPage={productPage}
        facetData={facetData}
      />
    </Container>
  );
}
