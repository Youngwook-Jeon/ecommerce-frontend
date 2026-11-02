"use client";

import { useId } from "react";
import { CategoryAttributePolicyInput } from "@/common/schemas/attributeCatalog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PolicyFlag = "enabled" | "required" | "optionAllowed" | "filterable";

export function updatePolicyFlag(input: CategoryAttributePolicyInput, flag: PolicyFlag, checked: boolean): CategoryAttributePolicyInput {
  if (flag === "enabled" && !checked) {
    return { ...input, enabled: false, required: false, optionAllowed: false, filterable: false };
  }
  return { ...input, [flag]: checked };
}

export const policyFlags = [
  ["enabled", "Enabled"], ["required", "Required"],
  ["optionAllowed", "Purchase Options"], ["filterable", "Search Filter"],
] as const;

export function CategoryAttributePolicyControls({ input, onChange, disabled = false }: {
  input: CategoryAttributePolicyInput;
  onChange: (value: CategoryAttributePolicyInput) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">{policyFlags.map(([flag, label]) => <div key={flag} className="flex items-center gap-2">
        <Checkbox id={`${id}-${flag}`} checked={input[flag]} disabled={disabled || (flag !== "enabled" && !input.enabled)} onCheckedChange={(checked) => onChange(updatePolicyFlag(input, flag, checked === true))} />
        <Label htmlFor={`${id}-${flag}`}>{label}</Label>
      </div>)}</div>
      <div className="space-y-2"><Label htmlFor={`${id}-order`}>Display Order</Label><Input id={`${id}-order`} type="number" min={0} max={2147483647} step={1} disabled={disabled} value={Number.isNaN(input.displayOrder) ? "" : input.displayOrder} onChange={(event) => onChange({ ...input, displayOrder: event.target.valueAsNumber })} required /></div>
    </div>
  );
}
