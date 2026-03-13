import Link from "next/link";

import { getAdminProducts } from "@/services/productService";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ProductsClientPage } from "@/modules/dashboard/ui/components/admin/products/ProductsClientPage";

interface AdminProductsPageProps {
  searchParams?: {
    page?: string;
    size?: string;
    keyword?: string;
    sort?: string;
  };
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const pageParam = searchParams?.page ?? "1";
  const sizeParam = searchParams?.size ?? "20";
  const keywordParam = searchParams?.keyword;
  const sortParam = searchParams?.sort ?? "createdAt,desc";

  const urlPage = Number(pageParam);
  const currentPage = Number.isNaN(urlPage) ? 0 : Math.max(0, urlPage - 1);
  const pageSize = Number.isNaN(Number(sizeParam)) ? 20 : Number(sizeParam);

  const page = await getAdminProducts({
    page: currentPage,
    size: pageSize,
    sort: sortParam,
    includeOrphans: true,
    keyword: keywordParam,
  });

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Breadcrumb className="mt-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/admin">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      {page ? (
        <ProductsClientPage initialPage={page} />
      ) : (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load products. Please try again later.
        </div>
      )}
    </div>
  );
}

