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
import { ProductDetailClient } from "@/modules/catalog/ui/components/ProductDetailClient";
import { getPublicProductDetail } from "@/services/publicProductService";

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { productId } = await params;

  let detail;
  try {
    detail = await getPublicProductDetail({ productId });
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
            <BreadcrumbPage>{detail.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ProductDetailClient detail={detail} />
    </Container>
  );
}

