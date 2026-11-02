"use client";

import Link from "next/link";
import { useState } from "react";
import { AttributeDefinitionVm, CategoryAttributeVm } from "@/common/schemas/attributeCatalog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AssignCategoryAttributeDialog } from "./AssignCategoryAttributeDialog";
import { CategoryAttributePolicyRow } from "./CategoryAttributePolicyRow";

export function CategoryAttributesClientPage({ categoryId, policies, definitions }: {
  categoryId: number;
  policies: CategoryAttributeVm[];
  definitions: AttributeDefinitionVm[];
}) {
  const [assigning, setAssigning] = useState(false);
  const available = definitions.filter((definition) => definition.status === "ACTIVE" && !policies.some((entry) => entry.attribute.id === definition.id));
  const sorted = [...policies].sort((left, right) => left.policy.displayOrder - right.policy.displayOrder || left.attribute.code.localeCompare(right.attribute.code));
  const nextOrder = Math.min(2147483647, Math.max(-1, ...policies.map((entry) => entry.policy.displayOrder)) + 1);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Only attributes explicitly assigned to this category apply. Parent policies are not inherited.</p><div className="flex gap-2"><Button variant="outline" asChild><Link href="/dashboard/admin/attributes">Manage Definitions</Link></Button><Button onClick={() => setAssigning(true)}>Assign Attribute</Button></div></div>
      <div className="rounded-md border"><Table>
        <TableHeader><TableRow><TableHead>Attribute</TableHead><TableHead>Enabled</TableHead><TableHead>Required</TableHead><TableHead>Purchase Options</TableHead><TableHead>Search Filter</TableHead><TableHead>Order</TableHead><TableHead>Saved Availability</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>{sorted.map((entry) => <CategoryAttributePolicyRow key={`${entry.attribute.id}-${JSON.stringify(entry.policy)}-${entry.attribute.status}`} categoryId={categoryId} entry={entry} />)}
          {policies.length === 0 && <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">No attributes assigned. Choose an existing definition to configure this category.</TableCell></TableRow>}
        </TableBody>
      </Table></div>
      {assigning && <AssignCategoryAttributeDialog categoryId={categoryId} definitions={available} nextOrder={nextOrder} onClose={() => setAssigning(false)} />}
    </div>
  );
}
