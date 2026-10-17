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
  hasActiveCatalogFilters,
  parsePlpSearchParams,
} from "@/modules/catalog/lib/plpSearchParams";
import { getCategoryBreadcrumbPath } from "@/modules/catalog/lib/categoryTreeUtils";
import { ProductSearchFeedback } from "@/modules/catalog/ui/components/ProductSearchFeedback";
import { ProductCatalogLayout } from "@/modules/catalog/ui/components/ProductCatalogLayout";
import { searchPublicProducts } from "@/services/publicProductService";
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

  if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
    notFound();
  }

  let plpParams;
  let productPage;
  let categoryHierarchy;
  try {
    plpParams = parsePlpSearchParams(await searchParams);
    [productPage, categoryHierarchy] = await Promise.all([
      searchPublicProducts({ categoryId, ...plpParams }),
      getPublicCategoryHierarchy(),
    ]);
    plpParams = { ...plpParams, q: productPage.query.q ?? undefined, sort: productPage.query.sort };
  } catch (error) {
    if (isPublicProductApiError(error)) {
      if (error.status === 404) notFound();
      return <Container className="py-10"><ProductSearchFeedback status={error.status} code={error.code} /></Container>;
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
          {hasActiveCatalogFilters(plpParams) ? " · filtered" : ""}
        </p>
      </header>

      <ProductCatalogLayout
        categoryId={categoryId}
        plpParams={plpParams}
        productPage={productPage}
      />
    </Container>
  );
}
