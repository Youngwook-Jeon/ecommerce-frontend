import Link from "next/link";
import { getAttributeDefinitions } from "@/services/attributeCatalogService";
import { AttributesClientPage } from "@/modules/dashboard/ui/components/admin/attributes/AttributesClientPage";
import { CatalogError } from "@/modules/dashboard/ui/components/admin/attributes/CatalogFeedback";

export default async function AttributesPage() {
  const result = await getAttributeDefinitions();
  return (
    <div className="space-y-6">
      <header className="space-y-2"><nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link href="/dashboard/admin">Dashboard</Link> / Attributes</nav><h1 className="text-2xl font-bold">Attributes</h1><p className="text-sm text-muted-foreground">Define shared product specifications and their standard values.</p></header>
      {result.success ? <AttributesClientPage definitions={result.data} /> : <CatalogError message={result.message} />}
    </div>
  );
}
