import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getAttributeValueChoices } from "@/services/attributeCatalogService";
import { AttributeDetailClientPage } from "@/modules/dashboard/ui/components/admin/attributes/AttributeDetailClientPage";
import { CatalogError } from "@/modules/dashboard/ui/components/admin/attributes/CatalogFeedback";

export default async function AttributeDetailPage({ params }: { params: Promise<{ attributeId: string }> }) {
  const { attributeId } = await params;
  if (!z.string().uuid().safeParse(attributeId).success) notFound();
  const result = await getAttributeValueChoices(attributeId);
  return (
    <div className="space-y-6">
      <header className="space-y-2"><nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><Link href="/dashboard/admin">Dashboard</Link> / <Link href="/dashboard/admin/attributes">Attributes</Link> / Details</nav><h1 className="text-2xl font-bold">Attribute Details</h1></header>
      {result.success ? <AttributeDetailClientPage definition={result.data.definition} values={result.data.values} /> : <CatalogError message={result.message} />}
    </div>
  );
}
