"use client";

import { getOptionStatusBadgeVariant } from "@/lib/statusBadge";
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
import { OptionGroupsTabProps, OptionSelectionConfig } from "./productOptionManager.types";

const emptySelection = (): OptionSelectionConfig => ({
  selected: false,
  priceDelta: 0,
  isDefault: false,
});

export function OptionGroupsTab({
  isLoading,
  detail,
  orderedGroups,
  globalOptionGroups,
  isDraftProduct,
  isReordering,
  isDeletingGroupId,
  isDeletingValueId,
  selectedGlobalGroupId,
  globalGroupsForCreate,
  required,
  selectedGlobalGroup,
  selectedCountForNewGroup,
  newGroupSelection,
  isSubmittingGroup,
  selectedProductOptionGroupId,
  selectedLocalGroup,
  availableOptionValuesForLocal,
  selectedCountForExisting,
  existingGroupSelection,
  canAddOptionValues,
  isSubmittingValues,
  setDraggingGroupId,
  onDragOverGroup,
  onDeleteOptionGroup,
  onDeleteOptionValue,
  onSaveGroupOrder,
  onSelectGlobalGroup,
  onToggleNewGroupValue,
  onChangeNewGroupSelectionField,
  onAddGroup,
  setRequired,
  onSelectProductOptionGroup,
  onToggleExistingGroupValue,
  onChangeExistingGroupSelectionField,
  onAddValuesToGroup,
}: OptionGroupsTabProps) {
  return (
    <TabsContent value="optionGroups">
      <div className="space-y-6">
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Currently Linked Option Groups</h3>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!isDraftProduct || isReordering || orderedGroups.length < 2}
              onClick={onSaveGroupOrder}
            >
              {isReordering ? "Saving Order..." : "Save Group Order"}
            </Button>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : detail?.optionGroups.length ? (
            <div className="space-y-3">
              {orderedGroups.map((group, index) => {
                const globalGroup = globalOptionGroups.find((g) => g.id === group.optionGroupId);

                return (
                  <div
                    key={group.productOptionGroupId}
                    draggable={isDraftProduct}
                    onDragStart={() => setDraggingGroupId(group.productOptionGroupId)}
                    onDragEnd={() => setDraggingGroupId(null)}
                    onDragOver={(e) => onDragOverGroup(e, group.productOptionGroupId)}
                    className="rounded-md border p-3"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {globalGroup
                          ? `${globalGroup.displayName} (${globalGroup.name})`
                          : group.optionGroupId}
                      </p>
                      <Badge variant="outline">step {index + 1}</Badge>
                      <Badge variant={group.required ? "default" : "secondary"}>
                        {group.required ? "REQUIRED" : "OPTIONAL"}
                      </Badge>
                      <Badge variant={getOptionStatusBadgeVariant(group.status)}>
                        {group.status}
                      </Badge>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        disabled={
                          !isDraftProduct ||
                          group.status === "DELETED" ||
                          isDeletingGroupId === group.productOptionGroupId
                        }
                        onClick={() => onDeleteOptionGroup(group.productOptionGroupId)}
                      >
                        {isDeletingGroupId === group.productOptionGroupId
                          ? "Deleting..."
                          : "Delete Group"}
                      </Button>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.optionValues.map((value) => {
                        const globalValue = globalGroup?.optionValues.find(
                          (v) => v.id === value.optionValueId
                        );
                        const displayLabel = globalValue
                          ? `${globalValue.displayName} (${globalValue.value})`
                          : value.optionValueId;
                        const priceDeltaText =
                          value.priceDelta > 0 ? ` (+$${value.priceDelta.toFixed(2)})` : "";

                        return (
                          <div
                            key={value.productOptionValueId}
                            className="inline-flex items-center gap-1"
                          >
                            <Badge variant={getOptionStatusBadgeVariant(value.status)}>
                              {displayLabel}
                              {priceDeltaText} - {value.status}
                            </Badge>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={
                                !isDraftProduct ||
                                value.status === "DELETED" ||
                                isDeletingValueId === value.productOptionValueId
                              }
                              onClick={() => onDeleteOptionValue(value.productOptionValueId)}
                            >
                              {isDeletingValueId === value.productOptionValueId
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No option groups are linked yet.</p>
          )}
        </section>

        <section className="space-y-3 rounded-md border p-4">
          <h3 className="text-sm font-semibold">Add Option Group</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Global Option Group</Label>
              <Select value={selectedGlobalGroupId} onValueChange={onSelectGlobalGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an option group" />
                </SelectTrigger>
                <SelectContent>
                  {globalGroupsForCreate.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.displayName} ({group.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 pb-2">
              <Checkbox
                id="required-toggle"
                checked={required}
                onCheckedChange={(checked) => setRequired(Boolean(checked))}
              />
              <Label htmlFor="required-toggle">Required option group</Label>
            </div>
          </div>

          {selectedGlobalGroup ? (
            <div className="space-y-2 rounded-md border p-3">
              <p className="text-xs text-muted-foreground">
                Selected option values: {selectedCountForNewGroup}
              </p>
              {selectedGlobalGroup.optionValues
                .filter((value) => value.status !== "DELETED")
                .map((value) => {
                  const state = newGroupSelection[value.id] ?? emptySelection();
                  return (
                    <div
                      key={value.id}
                      className="grid items-center gap-2 rounded-md border p-2 md:grid-cols-5"
                    >
                      <div className="col-span-2 flex items-center gap-2">
                        <Checkbox
                          checked={state.selected}
                          onCheckedChange={(checked) =>
                            onToggleNewGroupValue(value.id, Boolean(checked))
                          }
                        />
                        <span className="text-sm">
                          {value.displayName} ({value.value})
                        </span>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        disabled={!state.selected}
                        value={state.priceDelta}
                        onChange={(e) =>
                          onChangeNewGroupSelectionField(value.id, {
                            priceDelta: Number(e.target.value || 0),
                          })
                        }
                        placeholder="Price Delta"
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={state.isDefault}
                          disabled={!state.selected}
                          onCheckedChange={(checked) =>
                            onChangeNewGroupSelectionField(value.id, {
                              isDefault: Boolean(checked),
                            })
                          }
                        />
                        <span className="text-xs">Default</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={!isDraftProduct || !selectedGlobalGroupId || isSubmittingGroup}
              onClick={onAddGroup}
            >
              {isSubmittingGroup ? "Adding..." : "Add Option Group"}
            </Button>
          </div>
        </section>

        <section className="space-y-3 rounded-md border p-4">
          <h3 className="text-sm font-semibold">Add Option Values to Existing Group</h3>
          <div className="space-y-2">
            <Label>Product Option Group</Label>
            <Select
              value={selectedProductOptionGroupId}
              onValueChange={onSelectProductOptionGroup}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product option group" />
              </SelectTrigger>
              <SelectContent>
                {(detail?.optionGroups ?? []).map((group) => {
                  const gGroup = globalOptionGroups.find((g) => g.id === group.optionGroupId);
                  const label = gGroup
                    ? `${gGroup.displayName} (step ${group.stepOrder})`
                    : `step ${group.stepOrder}`;

                  return (
                    <SelectItem
                      key={group.productOptionGroupId}
                      value={group.productOptionGroupId}
                    >
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {selectedLocalGroup ? (
            <div className="space-y-2 rounded-md border p-3">
              <p className="text-xs text-muted-foreground">
                Available option values: {availableOptionValuesForLocal.length} / Selected:{" "}
                {selectedCountForExisting}
              </p>
              {availableOptionValuesForLocal.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No option values are available to add.
                </p>
              ) : (
                availableOptionValuesForLocal.map((value) => {
                  const state = existingGroupSelection[value.id] ?? emptySelection();
                  return (
                    <div
                      key={value.id}
                      className="grid items-center gap-2 rounded-md border p-2 md:grid-cols-5"
                    >
                      <div className="col-span-2 flex items-center gap-2">
                        <Checkbox
                          checked={state.selected}
                          onCheckedChange={(checked) =>
                            onToggleExistingGroupValue(value.id, Boolean(checked))
                          }
                        />
                        <span className="text-sm">
                          {value.displayName} ({value.value})
                        </span>
                      </div>
                      <Input
                        type="number"
                        step="0.01"
                        disabled={!state.selected}
                        value={state.priceDelta}
                        onChange={(e) =>
                          onChangeExistingGroupSelectionField(value.id, {
                            priceDelta: Number(e.target.value || 0),
                          })
                        }
                        placeholder="Price Delta"
                      />
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={state.isDefault}
                          disabled={!state.selected}
                          onCheckedChange={(checked) =>
                            onChangeExistingGroupSelectionField(value.id, {
                              isDefault: Boolean(checked),
                            })
                          }
                        />
                        <span className="text-xs">Default</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              disabled={!canAddOptionValues || !selectedProductOptionGroupId || isSubmittingValues}
              onClick={onAddValuesToGroup}
            >
              {isSubmittingValues ? "Adding..." : "Add Option Values"}
            </Button>
          </div>
        </section>
      </div>
    </TabsContent>
  );
}
