"use client";

import { Dispatch, DragEvent, SetStateAction, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { getOptionStatusBadgeVariant } from "@/lib/statusBadge";
import { OptionGroupVm } from "@/common/schemas/optionGroup";
import { getAdminOptionGroups } from "@/services/optionGroupService";
import {
  addProductOptionGroup,
  addProductOptionValues,
  AdminProductDetailVm,
  AdminProductDtoVm,
  ProductOptionGroupVm,
  deleteProductOptionGroup,
  deleteProductOptionValue,
  getAdminProductDetail,
  reorderProductOptionGroups,
} from "@/services/productService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OptionSelectionConfig = {
  selected: boolean;
  priceDelta: number;
  isDefault: boolean;
};

interface ProductOptionManagerDialogProps {
  product: AdminProductDtoVm | null;
  isOpen: boolean;
  onClose: () => void;
}

const emptySelection = (): OptionSelectionConfig => ({
  selected: false,
  priceDelta: 0,
  isDefault: false,
});

export function ProductOptionManagerDialog({
  product,
  isOpen,
  onClose,
}: ProductOptionManagerDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [detail, setDetail] = useState<AdminProductDetailVm | null>(null);
  const [globalOptionGroups, setGlobalOptionGroups] = useState<OptionGroupVm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
  const [isSubmittingValues, setIsSubmittingValues] = useState(false);
  const [isDeletingGroupId, setIsDeletingGroupId] = useState<string | null>(null);
  const [isDeletingValueId, setIsDeletingValueId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [draggingGroupId, setDraggingGroupId] = useState<string | null>(null);
  const [orderedGroupIds, setOrderedGroupIds] = useState<string[]>([]);

  const [selectedGlobalGroupId, setSelectedGlobalGroupId] = useState<string>("");
  const [required, setRequired] = useState(true);
  const [newGroupSelection, setNewGroupSelection] = useState<
    Record<string, OptionSelectionConfig>
  >({});

  const [selectedProductOptionGroupId, setSelectedProductOptionGroupId] =
    useState<string>("");
  const [existingGroupSelection, setExistingGroupSelection] = useState<
    Record<string, OptionSelectionConfig>
  >({});

  const refreshData = async () => {
    if (!product) return;
    setIsLoading(true);
    const [detailResult, globalGroups] = await Promise.all([
      getAdminProductDetail(product.id),
      getAdminOptionGroups(),
    ]);
    setDetail(detailResult);
    setGlobalOptionGroups(globalGroups.filter((group) => group.status !== "DELETED"));
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isOpen || !product) return;
    void refreshData();
    setSelectedGlobalGroupId("");
    setSelectedProductOptionGroupId("");
    setNewGroupSelection({});
    setExistingGroupSelection({});
    setRequired(true);
  }, [isOpen, product]);

  useEffect(() => {
    const sorted = [...(detail?.optionGroups ?? [])]
      .sort((a, b) => a.stepOrder - b.stepOrder)
      .map((group) => group.productOptionGroupId);
    setOrderedGroupIds(sorted);
  }, [detail]);

  const groupIdsInProduct = useMemo(
    () =>
      new Set(
        (detail?.optionGroups ?? [])
          .filter((group) => group.status !== "DELETED")
          .map((group) => group.optionGroupId)
      ),
    [detail]
  );

  const globalGroupsForCreate = useMemo(
    () => globalOptionGroups.filter((group) => !groupIdsInProduct.has(group.id)),
    [globalOptionGroups, groupIdsInProduct]
  );

  const selectedGlobalGroup = useMemo(
    () => globalOptionGroups.find((group) => group.id === selectedGlobalGroupId) ?? null,
    [globalOptionGroups, selectedGlobalGroupId]
  );

  const selectedLocalGroup = useMemo(
    () =>
      (detail?.optionGroups ?? []).find(
        (group) => group.productOptionGroupId === selectedProductOptionGroupId
      ) ?? null,
    [detail, selectedProductOptionGroupId]
  );

  const globalGroupForLocal = useMemo(() => {
    if (!selectedLocalGroup) return null;
    return (
      globalOptionGroups.find((group) => group.id === selectedLocalGroup.optionGroupId) ??
      null
    );
  }, [globalOptionGroups, selectedLocalGroup]);

  const availableOptionValuesForLocal = useMemo(() => {
    if (!selectedLocalGroup || !globalGroupForLocal) return [];
    const used = new Set(selectedLocalGroup.optionValues.map((value) => value.optionValueId));
    return globalGroupForLocal.optionValues.filter(
      (value) => value.status !== "DELETED" && !used.has(value.id)
    );
  }, [selectedLocalGroup, globalGroupForLocal]);

  const selectedCountForNewGroup = Object.values(newGroupSelection).filter(
    (item) => item.selected
  ).length;
  const selectedCountForExisting = Object.values(existingGroupSelection).filter(
    (item) => item.selected
  ).length;
  const isDraftProduct = product?.status === "DRAFT";
  const canAddOptionValues = product?.status === "DRAFT" || product?.status === "ACTIVE";
  const orderedGroups = useMemo(() => {
    const map = new Map((detail?.optionGroups ?? []).map((g) => [g.productOptionGroupId, g]));
    const inOrder = orderedGroupIds
      .map((id) => map.get(id))
      .filter((group): group is ProductOptionGroupVm => Boolean(group))
      .filter((group) => group.status !== "DELETED");
    const activeGroups = (detail?.optionGroups ?? []).filter((group) => group.status !== "DELETED");
    if (inOrder.length === activeGroups.length) return inOrder;
    return [...activeGroups].sort((a, b) => a.stepOrder - b.stepOrder);
  }, [detail, orderedGroupIds]);

  const onToggleNewGroupValue = (optionValueId: string, checked: boolean) => {
    setNewGroupSelection((prev) => ({
      ...prev,
      [optionValueId]: {
        ...(prev[optionValueId] ?? emptySelection()),
        selected: checked,
      },
    }));
  };

  const onToggleExistingGroupValue = (optionValueId: string, checked: boolean) => {
    setExistingGroupSelection((prev) => ({
      ...prev,
      [optionValueId]: {
        ...(prev[optionValueId] ?? emptySelection()),
        selected: checked,
      },
    }));
  };

  const onChangeSelectionField = (
    setter: Dispatch<SetStateAction<Record<string, OptionSelectionConfig>>>,
    optionValueId: string,
    patch: Partial<OptionSelectionConfig>
  ) => {
    setter((prev) => ({
      ...prev,
      [optionValueId]: {
        ...(prev[optionValueId] ?? emptySelection()),
        ...patch,
      },
    }));
  };

  const handleAddGroup = async () => {
    if (!product || !selectedGlobalGroupId) return;
    const optionValues = Object.entries(newGroupSelection)
      .filter(([, value]) => value.selected)
      .map(([optionValueId, value]) => ({
        optionValueId,
        priceDelta: value.priceDelta,
        isDefault: value.isDefault,
      }));

    if (optionValues.length === 0) {
      toast({
        variant: "destructive",
        title: "Selection required",
        description: "Please select at least one option value.",
      });
      return;
    }

    setIsSubmittingGroup(true);
    const result = await addProductOptionGroup(product.id, {
      optionGroupId: selectedGlobalGroupId,
      required,
      optionValues,
    });
    setIsSubmittingGroup(false);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Failed to add option group",
        description: result.message,
      });
      return;
    }

    toast({
      title: "Option group added",
      description: "The option group has been linked to this product.",
    });
    
    setSelectedGlobalGroupId("");
    setNewGroupSelection({});
    setRequired(true);
    
    await refreshData();
    router.refresh();
  };

  const handleAddValuesToGroup = async () => {
    if (!product || !selectedProductOptionGroupId) return;
    const optionValues = Object.entries(existingGroupSelection)
      .filter(([, value]) => value.selected)
      .map(([optionValueId, value]) => ({
        optionValueId,
        priceDelta: value.priceDelta,
        isDefault: value.isDefault,
      }));

    if (optionValues.length === 0) {
      toast({
        variant: "destructive",
        title: "Selection required",
        description: "Please select option values to add.",
      });
      return;
    }

    setIsSubmittingValues(true);
    const result = await addProductOptionValues(
      product.id,
      selectedProductOptionGroupId,
      { optionValues }
    );
    setIsSubmittingValues(false);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Failed to add option values",
        description: result.message,
      });
      return;
    }

    toast({
      title: "Option values added",
      description: "Selected option values have been added to the product option group.",
    });
    setExistingGroupSelection({});
    await refreshData();
    router.refresh();
  };

  const handleDeleteOptionGroup = async (productOptionGroupId: string) => {
    if (!product || !isDraftProduct) return;
    if (
      !window.confirm(
        "Deleting this option group will soft-delete all variants of this product. Continue?"
      )
    ) {
      return;
    }

    setIsDeletingGroupId(productOptionGroupId);
    const result = await deleteProductOptionGroup(product.id, productOptionGroupId);
    setIsDeletingGroupId(null);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Failed to delete option group",
        description: result.message,
      });
      return;
    }

    toast({
      title: "Option group deleted",
      description: "The option group was soft-deleted and all variants were invalidated.",
    });
    await refreshData();
    router.refresh();
  };

  const handleDeleteOptionValue = async (productOptionValueId: string) => {
    if (!product || !isDraftProduct) return;
    if (
      !window.confirm(
        "Deleting this option value will soft-delete variants containing this value. Continue?"
      )
    ) {
      return;
    }

    setIsDeletingValueId(productOptionValueId);
    const result = await deleteProductOptionValue(product.id, productOptionValueId);
    setIsDeletingValueId(null);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Failed to delete option value",
        description: result.message,
      });
      return;
    }

    toast({
      title: "Option value deleted",
      description: "The option value was soft-deleted and related variants were invalidated.",
    });
    await refreshData();
    router.refresh();
  };

  const handleDragOverGroup = (e: DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggingGroupId || draggingGroupId === targetId) return;
    setOrderedGroupIds((prev) => {
      const next = [...prev];
      const from = next.indexOf(draggingGroupId);
      const to = next.indexOf(targetId);
      if (from < 0 || to < 0) return prev;
      next.splice(from, 1);
      next.splice(to, 0, draggingGroupId);
      return next;
    });
  };

  const handleSaveGroupOrder = async () => {
    if (!product || !isDraftProduct || orderedGroups.length === 0) return;
    setIsReordering(true);
    const orderedProductOptionGroupIds = orderedGroups.map((group) => group.productOptionGroupId);
    const result = await reorderProductOptionGroups(product.id, orderedProductOptionGroupIds);
    if (!result.success) {
      setIsReordering(false);
      toast({
        variant: "destructive",
        title: "Failed to reorder option groups",
        description: result.message,
      });
      return;
    }
    setIsReordering(false);
    toast({
      title: "Order updated",
      description: "Option group order has been updated.",
    });
    await refreshData();
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Manage Product Options</DialogTitle>
          <DialogDescription>
            Manage option groups and values linked to{" "}
            <span className="font-medium">{product?.name ?? "-"}</span>.
          </DialogDescription>
        </DialogHeader>

        {!isDraftProduct ? (
          <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700">
            Option group add/delete and reordering are available only when the product is DRAFT.
            Adding option values to an existing group is available in DRAFT and ACTIVE.
          </div>
        ) : null}

        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Currently Linked Option Groups</h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!isDraftProduct || isReordering || orderedGroups.length < 2}
                onClick={handleSaveGroupOrder}
              >
                {isReordering ? "Saving Order..." : "Save Group Order"}
              </Button>
            </div>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : detail?.optionGroups.length ? (
              <div className="space-y-3">
                {orderedGroups.map((group, index) => {
                  // UI 표시를 위해 원본 글로벌 그룹 찾기
                  const globalGroup = globalOptionGroups.find(
                    (g) => g.id === group.optionGroupId
                  );

                  return (
                    <div
                      key={group.productOptionGroupId}
                      draggable={isDraftProduct}
                      onDragStart={() => setDraggingGroupId(group.productOptionGroupId)}
                      onDragEnd={() => setDraggingGroupId(null)}
                      onDragOver={(e) => handleDragOverGroup(e, group.productOptionGroupId)}
                      className="rounded-md border p-3"
                    >
                      <div className="flex items-center gap-2">
                        {/* 글로벌 사전의 이름으로 노출 */}
                        <p className="text-sm font-medium">
                          {globalGroup ? `${globalGroup.displayName} (${globalGroup.name})` : group.optionGroupId}
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
                        onClick={() => handleDeleteOptionGroup(group.productOptionGroupId)}
                      >
                        {isDeletingGroupId === group.productOptionGroupId
                          ? "Deleting..."
                          : "Delete Group"}
                      </Button>
                      </div>
                      
                      <div className="mt-2 flex flex-wrap gap-2">
                        {group.optionValues.map((value) => {
                          // 글로벌 사전과 매칭하여 진짜 이름과 가격 델타 표시
                          const globalValue = globalGroup?.optionValues.find(
                            (v) => v.id === value.optionValueId
                          );
                          const displayLabel = globalValue
                            ? `${globalValue.displayName} (${globalValue.value})`
                            : value.optionValueId;
                          
                          // 가격 델타 포맷팅 (달러 기준)
                          const priceDeltaText = value.priceDelta > 0 
                            ? ` (+$${value.priceDelta.toFixed(2)})` 
                            : "";

                          return (
                            <div key={value.productOptionValueId} className="inline-flex items-center gap-1">
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
                                onClick={() => handleDeleteOptionValue(value.productOptionValueId)}
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
              <p className="text-sm text-muted-foreground">
                No option groups are linked yet.
              </p>
            )}
          </section>

          <section className="space-y-3 rounded-md border p-4">
            <h3 className="text-sm font-semibold">Add Option Group</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Global Option Group</Label>
                <Select
                  value={selectedGlobalGroupId}
                  onValueChange={(value) => {
                    setSelectedGlobalGroupId(value);
                    setNewGroupSelection({});
                  }}
                >
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
                            onChangeSelectionField(setNewGroupSelection, value.id, {
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
                              onChangeSelectionField(setNewGroupSelection, value.id, {
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
                onClick={handleAddGroup}
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
                onValueChange={(value) => {
                  setSelectedProductOptionGroupId(value);
                  setExistingGroupSelection({});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product option group" />
                </SelectTrigger>
                <SelectContent>
                  {(detail?.optionGroups ?? []).map((group) => {
                    const gGroup = globalOptionGroups.find(g => g.id === group.optionGroupId);
                    const label = gGroup ? `${gGroup.displayName} (step ${group.stepOrder})` : `step ${group.stepOrder}`;
                    
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
                            onChangeSelectionField(setExistingGroupSelection, value.id, {
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
                              onChangeSelectionField(setExistingGroupSelection, value.id, {
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
                onClick={handleAddValuesToGroup}
              >
                {isSubmittingValues ? "Adding..." : "Add Option Values"}
              </Button>
            </div>
          </section>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}