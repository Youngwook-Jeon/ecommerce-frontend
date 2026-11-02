"use client";

import Link from "next/link";
import { useState } from "react";
import { CategoryAttributePolicyInput, CategoryAttributeVm } from "@/common/schemas/attributeCatalog";
import { setCategoryAttributePolicy, removeCategoryAttributePolicy } from "@/services/attributeCatalogService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import { ConfirmCatalogAction } from "./CatalogDialogs";
import { MutationError } from "./CatalogFeedback";
import { useCatalogMutation } from "./useCatalogMutation";
import { policyFlags, updatePolicyFlag } from "./CategoryAttributePolicyControls";

export function CategoryAttributePolicyRow({ categoryId, entry }: { categoryId: number; entry: CategoryAttributeVm }) {
  const { attribute, policy } = entry;
  const [input, setInput] = useState<CategoryAttributePolicyInput>({
    enabled: policy.enabled, required: policy.required, optionAllowed: policy.optionAllowed,
    filterable: policy.filterable, displayOrder: policy.displayOrder,
  });
  const [removing, setRemoving] = useState(false);
  const mutation = useCatalogMutation();
  const inactive = attribute.status !== "ACTIVE";
  const dirty = input.enabled !== policy.enabled || input.required !== policy.required ||
    input.optionAllowed !== policy.optionAllowed || input.filterable !== policy.filterable || input.displayOrder !== policy.displayOrder;
  return (
    <TableRow>
      <TableCell className="min-w-52">
        <Link href={`/dashboard/admin/attributes/${attribute.id}`} className="font-medium underline underline-offset-4">{attribute.displayName}</Link>
        <p className="text-xs text-muted-foreground">{attribute.code}</p>
        {inactive && <Badge variant="secondary" className="mt-1">Inactive definition</Badge>}
      </TableCell>
      {policyFlags.map(([flag, label]) => <TableCell key={flag}>
        <Checkbox aria-label={`${label} for ${attribute.displayName}`} checked={input[flag]}
          disabled={mutation.pending || (flag === "enabled" ? inactive && !input.enabled : inactive || !input.enabled)}
          onCheckedChange={(checked) => setInput(updatePolicyFlag(input, flag, checked === true))} />
      </TableCell>)}
      <TableCell><Input className="w-24" type="number" min={0} max={2147483647} step={1} aria-label={`Display order for ${attribute.displayName}`} value={Number.isNaN(input.displayOrder) ? "" : input.displayOrder} disabled={mutation.pending} onChange={(event) => setInput({ ...input, displayOrder: event.target.valueAsNumber })} /></TableCell>
      <TableCell className="min-w-56 text-xs text-muted-foreground">
        {inactive ? "Unavailable: attribute is inactive. Disable or remove the policy to retire it." : !policy.usable ? "Unavailable: policy is disabled." : (
          <span>Available · Options: {policy.optionAvailable ? "Yes" : "No"} · Filter: {policy.filterAvailable ? "Yes" : "No"}</span>
        )}
        {dirty && <p className="mt-1">Unsaved changes. Availability reflects the saved policy.</p>}
      </TableCell>
      <TableCell className="min-w-52 space-y-2">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={!dirty || mutation.pending || (inactive && input.enabled)} onClick={() => void mutation.run(() => setCategoryAttributePolicy(categoryId, attribute.id, input))}>{mutation.pending ? "Saving..." : "Save"}</Button>
          <Button size="sm" variant="outline" disabled={!dirty || mutation.pending} onClick={() => setInput({ enabled: policy.enabled, required: policy.required, optionAllowed: policy.optionAllowed, filterable: policy.filterable, displayOrder: policy.displayOrder })}>Reset</Button>
          <Button size="sm" variant="ghost" disabled={mutation.pending} onClick={() => setRemoving(true)}>Remove</Button>
        </div>
        <MutationError message={mutation.error} />
        {removing && <ConfirmCatalogAction title="Remove Category Policy?" description={`Remove ${attribute.displayName} from this category? The shared definition and its values will be preserved.`} actionLabel="Remove Policy" action={() => removeCategoryAttributePolicy(categoryId, attribute.id)} onClose={() => setRemoving(false)} />}
      </TableCell>
    </TableRow>
  );
}
