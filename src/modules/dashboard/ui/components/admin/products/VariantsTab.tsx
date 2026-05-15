"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsContent } from "@/components/ui/tabs";
import { VariantsTabProps } from "./productOptionManager.types";

const MAX_CARTESIAN_VARIANT_BATCH_SIZE = 200;

export function VariantsTab({
  isDraftProduct,
  variantGroups,
  variantSelectionsByGroup,
  optionValueLabelByProductOptionValueId,
  variantStockQuantity,
  canAddVariants,
  isSubmittingVariant,
  cartesianSelectionsByGroup,
  missingRequiredGroupsForCartesian,
  bulkVariantStockQuantity,
  rawCartesianCombinationCount,
  cartesianCombinationsForCreate,
  skippedExistingCombinationCount,
  cartesianPreviewRows,
  isSubmittingVariantBulk,
  isVariantsLoading,
  visibleVariants,
  variantStockEdits,
  variantStatusEdits,
  editableVariantStatuses,
  isUpdatingVariantId,
  isDeletingVariantId,
  setVariantSelectionsByGroup,
  setVariantStockQuantity,
  toggleCartesianSelection,
  setBulkVariantStockQuantity,
  onAddVariant,
  onAddVariantCartesian,
  setVariantStockEdits,
  setVariantStatusEdits,
  onUpdateVariant,
  onDeleteVariant,
}: VariantsTabProps) {
  return (
    <TabsContent value="variants">
      <div className="space-y-6 p-1">
        <section className="space-y-3 rounded-md border p-4">
          <h3 className="text-sm font-semibold">Create Variant</h3>
          {!isDraftProduct && canAddVariants ? (
            <p className="text-xs text-muted-foreground">
              Variant creation is available for all non-DELETED product statuses.
            </p>
          ) : null}
          {!canAddVariants ? (
            <p className="text-xs text-muted-foreground">
              Variants cannot be created when the product is DELETED.
            </p>
          ) : null}

          <div className="grid gap-3 md:grid-cols-2">
            {variantGroups.map(({ group, globalGroup, optionValues }) => (
              <div key={group.productOptionGroupId} className="space-y-2">
                <Label>
                  {globalGroup
                    ? `${globalGroup.displayName} (${globalGroup.name})`
                    : group.optionGroupId}
                </Label>
                <Select
                  value={variantSelectionsByGroup[group.productOptionGroupId] ?? ""}
                  onValueChange={(value) =>
                    setVariantSelectionsByGroup((prev) => ({
                      ...prev,
                      [group.productOptionGroupId]: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select option value" />
                  </SelectTrigger>
                  <SelectContent>
                    {optionValues.map((value) => (
                      <SelectItem
                        key={value.productOptionValueId}
                        value={value.productOptionValueId}
                      >
                        {optionValueLabelByProductOptionValueId.get(value.productOptionValueId) ??
                          value.optionValueId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="max-w-xs space-y-2">
            <Label>Stock Quantity</Label>
            <Input
              type="number"
              min={0}
              value={variantStockQuantity}
              onChange={(e) => setVariantStockQuantity(Number(e.target.value || 0))}
              placeholder="0"
            />
          </div>

          <div className="flex justify-end">
            <Button type="button" disabled={!canAddVariants || isSubmittingVariant} onClick={onAddVariant}>
              {isSubmittingVariant ? "Adding..." : "Add Variant"}
            </Button>
          </div>
        </section>

        <section className="space-y-3 rounded-md border p-4">
          <h3 className="text-sm font-semibold">Auto Generate Variants (Cartesian Product)</h3>
          <p className="text-xs text-muted-foreground">
            Select multiple values per group and generate all combinations at once.
          </p>

          <div className="space-y-3">
            {variantGroups.map(({ group, globalGroup, optionValues }) => (
              <div
                key={`cartesian-${group.productOptionGroupId}`}
                className="space-y-2 rounded-md border p-3"
              >
                <p className="text-sm font-medium">
                  {globalGroup
                    ? `${globalGroup.displayName} (${globalGroup.name})`
                    : group.optionGroupId}
                </p>
                <div className="flex flex-wrap gap-2">
                  {optionValues.map((value) => {
                    const checked = Boolean(
                      cartesianSelectionsByGroup[group.productOptionGroupId]?.[
                        value.productOptionValueId
                      ]
                    );
                    return (
                      <label
                        key={value.productOptionValueId}
                        className="inline-flex items-center gap-2 rounded border px-2 py-1 text-xs"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(next) =>
                            toggleCartesianSelection(
                              group.productOptionGroupId,
                              value.productOptionValueId,
                              Boolean(next)
                            )
                          }
                        />
                        <span>
                          {optionValueLabelByProductOptionValueId.get(value.productOptionValueId) ??
                            value.optionValueId}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {missingRequiredGroupsForCartesian.length > 0 ? (
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700">
              Required group selection missing: {missingRequiredGroupsForCartesian.join(", ")}
            </div>
          ) : null}

          <div className="max-w-xs space-y-2">
            <Label>Stock Quantity for Generated Variants</Label>
            <Input
              type="number"
              min={0}
              value={bulkVariantStockQuantity}
              onChange={(e) => setBulkVariantStockQuantity(Number(e.target.value || 0))}
              placeholder="0"
            />
          </div>

          <div className="rounded-md border bg-muted/30 p-3 text-xs">
            <p>
              Raw combinations: {rawCartesianCombinationCount}
              {rawCartesianCombinationCount > MAX_CARTESIAN_VARIANT_BATCH_SIZE
                ? ` (only first ${MAX_CARTESIAN_VARIANT_BATCH_SIZE} are processed)`
                : ""}
            </p>
            <p>New combinations to create: {cartesianCombinationsForCreate.length}</p>
            <p>Skipped existing active combinations: {skippedExistingCombinationCount}</p>
          </div>

          <div className="rounded-md border p-3 text-xs">
            <p className="mb-2 font-medium">Combination preview (up to 10)</p>
            {cartesianPreviewRows.length > 0 ? (
              <div className="space-y-1">
                {cartesianPreviewRows.map((row, index) => (
                  <p key={`${row}-${index}`} className="text-muted-foreground">
                    {index + 1}. {row}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No combinations to preview.</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={
                !canAddVariants ||
                isSubmittingVariantBulk ||
                missingRequiredGroupsForCartesian.length > 0 ||
                cartesianCombinationsForCreate.length === 0
              }
              onClick={onAddVariantCartesian}
            >
              {isSubmittingVariantBulk ? "Generating..." : "Generate Variants"}
            </Button>
          </div>
        </section>

        <section className="space-y-3 rounded-md border p-4">
          <h3 className="text-sm font-semibold">Product Variants</h3>
          <p className="text-xs text-muted-foreground">
            Thumbnail URLs are synced from the visual option group&apos;s option value images, or
            the product main image when no visual image applies.
          </p>

          {isVariantsLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : visibleVariants.length ? (
            <div className="space-y-3">
              {visibleVariants.map((variant) => {
                return (
                  <div key={variant.productVariantId} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {variant.mainImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={variant.mainImageUrl}
                            alt=""
                            className="h-12 w-12 shrink-0 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-muted text-[10px] text-muted-foreground">
                            No img
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium">{variant.sku}</p>
                          <p className="text-xs text-muted-foreground">
                            Stock: {variant.stockQuantity}
                          </p>
                        </div>
                      </div>
                      <Badge variant={variant.status === "ACTIVE" ? "default" : "secondary"}>
                        {variant.status}
                      </Badge>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">Price: ${variant.calculatedPrice}</div>

                    <div className="mt-3 grid gap-2 md:grid-cols-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Stock</Label>
                        <Input
                          type="number"
                          min={0}
                          value={
                            variantStockEdits[variant.productVariantId] ?? variant.stockQuantity
                          }
                          onChange={(e) =>
                            setVariantStockEdits((prev) => ({
                              ...prev,
                              [variant.productVariantId]: Number(e.target.value || 0),
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Status</Label>
                        <Select
                          value={variantStatusEdits[variant.productVariantId] ?? variant.status}
                          onValueChange={(value) =>
                            setVariantStatusEdits((prev) => ({
                              ...prev,
                              [variant.productVariantId]: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(variant.status === "DRAFT"
                              ? ["DRAFT", ...editableVariantStatuses]
                              : editableVariantStatuses
                            ).map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isUpdatingVariantId === variant.productVariantId}
                          onClick={() => onUpdateVariant(variant.productVariantId)}
                        >
                          {isUpdatingVariantId === variant.productVariantId ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={
                            isDeletingVariantId === variant.productVariantId ||
                            variant.status === "DELETED"
                          }
                          onClick={() => onDeleteVariant(variant.productVariantId)}
                        >
                          {isDeletingVariantId === variant.productVariantId
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {variant.selectedProductOptionValueIds.length ? (
                        variant.selectedProductOptionValueIds.map((id) => (
                          <Badge key={id} variant="outline">
                            {optionValueLabelByProductOptionValueId.get(id) ?? id}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No selected options</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No active variants found.</p>
          )}
        </section>
      </div>
    </TabsContent>
  );
}
