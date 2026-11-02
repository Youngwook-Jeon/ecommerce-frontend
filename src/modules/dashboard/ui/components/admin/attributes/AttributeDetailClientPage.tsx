"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AttributeDefinitionVm, AttributeValueVm } from "@/common/schemas/attributeCatalog";
import { deactivateAttribute, deleteAttribute, deleteAttributeValue, renameAttribute, renameAttributeValue } from "@/services/attributeCatalogService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmCatalogAction, RenameCatalogDialog } from "./CatalogDialogs";
import { CreateAttributeValueDialog } from "./CreateAttributeValueDialog";

type DetailAction = { kind: "rename" | "deactivate" | "delete" } |
  { kind: "renameValue" | "deleteValue"; value: AttributeValueVm };

function storedValue(value: AttributeValueVm, unit: string | null) {
  switch (value.dataType) {
    case "NUMBER": return `${value.numericValue}${unit ? ` ${unit}` : ""}`;
    case "BOOLEAN": return value.booleanValue ? "True" : "False";
    case "DATE": return value.dateValue;
    default: return value.textValue;
  }
}

export function AttributeDetailClientPage({ definition, values }: { definition: AttributeDefinitionVm; values: AttributeValueVm[] }) {
  const router = useRouter();
  const [action, setAction] = useState<DetailAction | null>(null);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const close = () => setAction(null);
  const matches = values.filter((value) => `${value.displayName} ${storedValue(value, definition.canonicalUnit)}`.toLowerCase().includes(search.trim().toLowerCase()));
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><div className="flex flex-wrap items-center gap-3"><CardTitle>{definition.displayName}</CardTitle><Badge variant={definition.status === "ACTIVE" ? "default" : "secondary"}>{definition.status}</Badge></div><CardDescription>Code: {definition.code} · Type: {definition.dataType} · Unit: {definition.canonicalUnit ?? "None"}</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {definition.status === "INACTIVE" && <p className="text-sm text-muted-foreground">This attribute is inactive. Existing values and policies are preserved; new values and new usage are blocked.</p>}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setAction({ kind: "rename" })}>Edit Name</Button>
            <Button variant="outline" disabled={definition.status !== "ACTIVE"} onClick={() => setAction({ kind: "deactivate" })}>Deactivate</Button>
            <Button variant="outline" onClick={() => setAction({ kind: "delete" })}>Delete Definition</Button>
            {definition.status === "ACTIVE" && <Button asChild><Link href={`/dashboard/admin/option-groups?attributeId=${definition.id}`}>Manage Purchase Options</Link></Button>}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3"><div><CardTitle>Attribute Values</CardTitle><CardDescription>Standard values shared by product specifications and purchase options.</CardDescription></div><Button disabled={definition.status !== "ACTIVE"} onClick={() => setAdding(true)}>Add Value</Button></CardHeader>
        <CardContent className="space-y-4">
          <Input className="max-w-sm" aria-label="Search attribute values" placeholder="Search values" value={search} onChange={(event) => setSearch(event.target.value)} />
          <div className="rounded-md border"><Table>
            <TableHeader><TableRow><TableHead>Display Name</TableHead><TableHead>Value</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>{matches.map((value) => <TableRow key={value.id}>
              <TableCell>{value.displayName}</TableCell><TableCell>{storedValue(value, definition.canonicalUnit)}</TableCell>
              <TableCell className="space-x-2 text-right"><Button variant="outline" size="sm" onClick={() => setAction({ kind: "renameValue", value })}>Rename</Button><Button variant="outline" size="sm" onClick={() => setAction({ kind: "deleteValue", value })}>Delete</Button></TableCell>
            </TableRow>)}{matches.length === 0 && <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">{values.length === 0 ? "No values yet. Add a standard value to get started." : "No matching values."}</TableCell></TableRow>}</TableBody>
          </Table></div>
        </CardContent>
      </Card>
      {adding && <CreateAttributeValueDialog definition={definition} onClose={() => setAdding(false)} />}
      {action?.kind === "rename" && <RenameCatalogDialog title="Rename Attribute" displayName={definition.displayName} onSave={(input) => renameAttribute(definition.id, input)} onClose={close} />}
      {action?.kind === "renameValue" && <RenameCatalogDialog title="Rename Attribute Value" displayName={action.value.displayName} onSave={(input) => renameAttributeValue(definition.id, action.value.id, input)} onClose={close} />}
      {action?.kind === "deactivate" && <ConfirmCatalogAction title="Deactivate Attribute?" description="Existing references will be preserved, but this attribute will no longer be available for new values or enabled category policies. Reactivation is not available." actionLabel="Deactivate" action={() => deactivateAttribute(definition.id)} onClose={close} />}
      {action?.kind === "delete" && <ConfirmCatalogAction title="Delete Attribute Definition?" description="Only unreferenced definitions can be deleted. If values, category policies, or option groups reference this definition, deletion will be rejected. Use deactivation to retire an attribute with references." actionLabel="Delete Definition" action={() => deleteAttribute(definition.id)} onClose={close} onSuccess={() => router.push("/dashboard/admin/attributes")} />}
      {action?.kind === "deleteValue" && <ConfirmCatalogAction title="Delete Attribute Value?" description={`Delete "${action.value.displayName}"? Values referenced by purchase options cannot be deleted.`} actionLabel="Delete Value" action={() => deleteAttributeValue(definition.id, action.value.id)} onClose={close} />}
    </div>
  );
}
