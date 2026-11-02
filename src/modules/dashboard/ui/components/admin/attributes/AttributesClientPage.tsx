"use client";

import Link from "next/link";
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { AttributeDefinitionVm } from "@/common/schemas/attributeCatalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreateAttributeDialog } from "./CreateAttributeDialog";

export function AttributesClientPage({ definitions }: { definitions: AttributeDefinitionVm[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [creating, setCreating] = useState(false);
  const matches = definitions.filter((definition) =>
    (status === "ALL" || definition.status === status) &&
    `${definition.code} ${definition.displayName}`.toLowerCase().includes(search.trim().toLowerCase())
  );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input className="max-w-sm" aria-label="Search attributes" placeholder="Search by name or code" value={search} onChange={(event) => setSearch(event.target.value)} />
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-44" aria-label="Filter by status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">All statuses</SelectItem><SelectItem value="ACTIVE">Active</SelectItem><SelectItem value="INACTIVE">Inactive</SelectItem></SelectContent></Select>
        <Button className="ml-auto" onClick={() => setCreating(true)}><PlusCircle className="mr-2 h-4 w-4" />Create Attribute</Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow><TableHead>Display Name</TableHead><TableHead>Code</TableHead><TableHead>Type</TableHead><TableHead>Unit</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {matches.map((definition) => <TableRow key={definition.id}>
              <TableCell><Link className="font-medium underline underline-offset-4" href={`/dashboard/admin/attributes/${definition.id}`}>{definition.displayName}</Link></TableCell>
              <TableCell>{definition.code}</TableCell><TableCell>{definition.dataType}</TableCell><TableCell>{definition.canonicalUnit ?? "—"}</TableCell>
              <TableCell><Badge variant={definition.status === "ACTIVE" ? "default" : "secondary"}>{definition.status}</Badge></TableCell>
              <TableCell><Button variant="outline" size="sm" asChild><Link href={`/dashboard/admin/attributes/${definition.id}`}>Manage</Link></Button></TableCell>
            </TableRow>)}
            {matches.length === 0 && <TableRow><TableCell colSpan={6} className="h-24 text-center text-muted-foreground">{definitions.length === 0 ? "No attributes yet. Create a definition to get started." : "No matching attributes."}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
      {creating && <CreateAttributeDialog onClose={() => setCreating(false)} />}
    </div>
  );
}
