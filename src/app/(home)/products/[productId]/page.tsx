import type { Metadata } from "next";
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
import { parseProductIdParam } from "@/modules/catalog/lib/parseProductIdParam";
import { findCategoryById } from "@/modules/catalog/lib/categoryTreeUtils";
import { ProductDetailClient } from "@/modules/catalog/ui/components/ProductDetailClient";
import { getPublicProductDetail } from "@/services/publicProductService";
import { getPublicCategoryHierarchy } from "@/services/publicCategoryService";

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

function resolveOgImageUrl(
  mainImageUrl: string | null | undefined,
  images: { url: string }[]
): string | undefined {
  if (mainImageUrl) {
    return mainImageUrl;
  }
  return images[0]?.url;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { productId: productIdRaw } = await params;
  const productId = parseProductIdParam(productIdRaw);

  if (!productId) {
    return { title: "Product not found" };
  }

  try {
    const detail = await getPublicProductDetail({ productId });
    const ogImage = resolveOgImageUrl(detail.mainImageUrl, detail.images);

    return {
      title: detail.name,
      description: detail.description ?? `${detail.name} — shop now at Ecomart.`,
      openGraph: {
        title: detail.name,
        description: detail.description ?? undefined,
        images: ogImage ? [{ url: ogImage }] : undefined,
      },
    };
  } catch (error) {
    if (isPublicProductApiError(error) && error.status === 404) {
      return { title: "Product not found" };
    }
    return { title: "Product" };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId: productIdRaw } = await params;
  const productId = parseProductIdParam(productIdRaw);

  if (!productId) {
    notFound();
  }

  let detail;
  try {
    detail = await getPublicProductDetail({ productId });
  } catch (error) {
    if (isPublicProductApiError(error) && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const showCategoryCrumb =
    detail.listedInCatalog && detail.categoryId != null && detail.categoryId > 0;

  const categoryName = showCategoryCrumb
    ? (
        await getPublicCategoryHierarchy().then((hierarchy) =>
          findCategoryById(hierarchy, detail.categoryId!)
        )
      )?.name ?? `Category ${detail.categoryId}`
    : null;

  return (
    <Container className="py-10">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          {showCategoryCrumb ? (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/categories">Categories</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={`/categories/${detail.categoryId}`}>
                    {categoryName}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </>
          ) : null}
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{detail.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ProductDetailClient detail={detail} />
    </Container>
  );
}
