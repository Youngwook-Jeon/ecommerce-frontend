import Link from "next/link";
import { z } from "zod";

import { getAdminOptionGroups } from "@/services/optionGroupService";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { OptionGroupsClientPage } from "@/modules/dashboard/ui/components/admin/option-groups/OptionGroupsClientPage";

export default async function AdminOptionGroupsPage({ searchParams }: {
  searchParams: Promise<{ attributeId?: string | string[] }>;
}) {
  const query = await searchParams;
  const parsedAttribute = z.string().uuid().safeParse(query.attributeId);
  const initialAttributeId = parsedAttribute.success ? parsedAttribute.data : undefined;
  const optionGroups = await getAdminOptionGroups();

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Option Groups</h1>
        <Breadcrumb className="mt-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard/admin">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Option Groups</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <OptionGroupsClientPage key={initialAttributeId ?? "all"} initialData={optionGroups} initialAttributeId={initialAttributeId} />
    </div>
  );
}
