import type {
  PublicProductDetailVm,
  PublicProductOptionGroupVm,
  PublicProductOptionValueVm,
  PublicProductVariantVm,
} from "@/common/schemas/publicProductDetail";

export function sortOptionGroups(
  groups: PublicProductOptionGroupVm[]
): PublicProductOptionGroupVm[] {
  return [...groups].sort((a, b) => a.stepOrder - b.stepOrder);
}

function priorSelectedIds(
  sortedGroups: PublicProductOptionGroupVm[],
  selectedByGroup: Record<string, string>,
  groupIndex: number
): string[] {
  return sortedGroups
    .slice(0, groupIndex)
    .map((group) => selectedByGroup[group.productOptionGroupId])
    .filter((id): id is string => Boolean(id));
}

function variantsCompatibleWithSelection(
  variants: PublicProductVariantVm[],
  selectedIds: string[]
): PublicProductVariantVm[] {
  if (selectedIds.length === 0) {
    return variants;
  }
  return variants.filter((variant) =>
    selectedIds.every((id) => variant.selectedProductOptionValueIds.includes(id))
  );
}

/** Values in this group that appear in at least one variant matching prior selections. */
export function getSelectableValues(
  sortedGroups: PublicProductOptionGroupVm[],
  variants: PublicProductVariantVm[],
  selectedByGroup: Record<string, string>,
  groupIndex: number
): PublicProductOptionValueVm[] {
  const group = sortedGroups[groupIndex];
  const compatibleVariants = variantsCompatibleWithSelection(
    variants,
    priorSelectedIds(sortedGroups, selectedByGroup, groupIndex)
  );

  const availableIds = new Set<string>();
  for (const variant of compatibleVariants) {
    for (const povId of variant.selectedProductOptionValueIds) {
      if (group.optionValues.some((value) => value.productOptionValueId === povId)) {
        availableIds.add(povId);
      }
    }
  }

  return group.optionValues.filter((value) =>
    availableIds.has(value.productOptionValueId)
  );
}

/**
 * Group is interactive once every earlier required group has a selection.
 * Optional groups may be skipped.
 */
export function isGroupUnlocked(
  sortedGroups: PublicProductOptionGroupVm[],
  selectedByGroup: Record<string, string>,
  groupIndex: number
): boolean {
  if (groupIndex === 0) {
    return true;
  }

  for (let i = 0; i < groupIndex; i++) {
    const group = sortedGroups[i];
    if (group.required && !selectedByGroup[group.productOptionGroupId]) {
      return false;
    }
  }

  return true;
}

/** No auto-selection — keeps the product gallery visible until the user picks options. */
export function buildInitialSelection(_detail: PublicProductDetailVm): Record<string, string> {
  return {};
}

export function areRequiredGroupsSelected(
  sortedGroups: PublicProductOptionGroupVm[],
  selectedByGroup: Record<string, string>
): boolean {
  return sortedGroups
    .filter((group) => group.required)
    .every((group) => Boolean(selectedByGroup[group.productOptionGroupId]));
}

/**
 * Resolved when every required group is chosen and selections map to exactly one variant.
 */
export function resolveSelectedVariant(
  sortedGroups: PublicProductOptionGroupVm[],
  variants: PublicProductVariantVm[],
  selectedByGroup: Record<string, string>
): PublicProductVariantVm | undefined {
  if (!areRequiredGroupsSelected(sortedGroups, selectedByGroup)) {
    return undefined;
  }

  const selectedIds = sortedGroups
    .map((group) => selectedByGroup[group.productOptionGroupId])
    .filter((id): id is string => Boolean(id));

  if (selectedIds.length === 0) {
    return variants.length === 1 ? variants[0] : undefined;
  }

  const selectedSet = new Set(selectedIds);

  return variants.find(
    (variant) =>
      variant.selectedProductOptionValueIds.length === selectedSet.size &&
      variant.selectedProductOptionValueIds.every((id) => selectedSet.has(id))
  );
}

export function applyOptionSelection(
  sortedGroups: PublicProductOptionGroupVm[],
  selectedByGroup: Record<string, string>,
  groupId: string,
  valueId: string
): Record<string, string> {
  const groupIndex = sortedGroups.findIndex(
    (group) => group.productOptionGroupId === groupId
  );
  if (groupIndex < 0) {
    return selectedByGroup;
  }

  const next: Record<string, string> = { ...selectedByGroup };
  next[groupId] = valueId;

  for (let i = groupIndex + 1; i < sortedGroups.length; i++) {
    delete next[sortedGroups[i].productOptionGroupId];
  }

  return next;
}
