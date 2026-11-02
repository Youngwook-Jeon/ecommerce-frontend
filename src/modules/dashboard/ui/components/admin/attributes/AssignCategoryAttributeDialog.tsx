"use client";

import Link from "next/link";
import { useState } from "react";
import { AttributeDefinitionVm, CategoryAttributePolicyInput } from "@/common/schemas/attributeCatalog";
import { setCategoryAttributePolicy } from "@/services/attributeCatalogService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useCatalogMutation } from "./useCatalogMutation";
import { MutationError } from "./CatalogFeedback";
import { CategoryAttributePolicyControls } from "./CategoryAttributePolicyControls";

export function AssignCategoryAttributeDialog({ categoryId, definitions, nextOrder, onClose }: {
  categoryId: number;
  definitions: AttributeDefinitionVm[];
  nextOrder: number;
  onClose: () => void;
}) {
  const [search, setSearch] = useState("");
  const [attributeId, setAttributeId] = useState("");
  const [input, setInput] = useState<CategoryAttributePolicyInput>({ enabled: true, required: false, optionAllowed: false, filterable: false, displayOrder: nextOrder });
  const mutation = useCatalogMutation();
  const matches = definitions.filter((definition) => definition.id === attributeId || `${definition.code} ${definition.displayName}`.toLowerCase().includes(search.trim().toLowerCase()));
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.pending) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Assign Attribute</DialogTitle><DialogDescription>Reuse an existing definition and configure its policy for this category.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); if (attributeId) void mutation.run(() => setCategoryAttributePolicy(categoryId, attributeId, input), onClose); }}>
          <Input aria-label="Search existing attributes" placeholder="Search by name or code" value={search} disabled={mutation.pending} onChange={(event) => setSearch(event.target.value)} />
          <div className="space-y-2"><Label htmlFor="assign-attribute">Attribute Definition</Label>
            <Select value={attributeId} onValueChange={setAttributeId} disabled={mutation.pending}>
              <SelectTrigger id="assign-attribute"><SelectValue placeholder="Select an attribute" /></SelectTrigger>
              <SelectContent>{matches.map((definition) => <SelectItem key={definition.id} value={definition.id}>{definition.displayName} ({definition.code})</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {matches.length === 0 && <p className="text-sm text-muted-foreground">No matching active, unassigned attributes. <Link className="underline" href="/dashboard/admin/attributes">Manage attribute definitions</Link>.</p>}
          <CategoryAttributePolicyControls input={input} onChange={setInput} disabled={mutation.pending} />
          <MutationError message={mutation.error} />
          <DialogFooter><Button type="button" variant="secondary" disabled={mutation.pending} onClick={onClose}>Cancel</Button><Button disabled={mutation.pending || !attributeId}>{mutation.pending ? "Saving..." : "Assign Attribute"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
