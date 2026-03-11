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

export default async function AdminProductsPage() {
  const page = await getAdminProducts({
    page: 0,
    size: 20,
    includeOrphans: true,
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
        <ProductsClientPage initialData={page.content} />
      ) : (
        <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          Failed to load products. Please try again later.
        </div>
      )}
    </div>
  );
}

