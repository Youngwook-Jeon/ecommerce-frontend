import Link from "next/link";

import { getCategoryHierarchy } from "@/services/categoryService";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CategoriesClientPage } from "@/modules/dashboard/ui/components/admin/categories/CategoryClientPage";

export default async function CategoriesPage() {
  const initialData = await getCategoryHierarchy();
  console.log(initialData);

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Breadcrumb className="mt-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/admin">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <CategoriesClientPage initialData={initialData} />
    </div>
  );
}
