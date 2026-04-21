"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
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
  getAdminProductDetail,
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

  const [selectedGlobalGroupId, setSelectedGlobalGroupId] = useState<string>("");
  const [stepOrder, setStepOrder] = useState(1);
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
    setStepOrder(1);
  }, [isOpen, product]);

  const groupIdsInProduct = useMemo(
    () => new Set((detail?.optionGroups ?? []).map((group) => group.optionGroupId)),
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
      stepOrder,
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
    
    // 성공 시 입력 폼 상태 완전히 초기화
    setSelectedGlobalGroupId("");
    setNewGroupSelection({});
    setStepOrder(1); 
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

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Currently Linked Option Groups</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : detail?.optionGroups.length ? (
              <div className="space-y-3">
                {detail.optionGroups.map((group) => {
                  // UI 표시를 위해 원본 글로벌 그룹 찾기
                  const globalGroup = globalOptionGroups.find(
                    (g) => g.id === group.optionGroupId
                  );

                  return (
                    <div key={group.productOptionGroupId} className="rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        {/* 글로벌 사전의 이름으로 노출 */}
                        <p className="text-sm font-medium">
                          {globalGroup ? `${globalGroup.displayName} (${globalGroup.name})` : group.optionGroupId}
                        </p>
                        <Badge variant="outline">step {group.stepOrder}</Badge>
                        <Badge variant={group.required ? "default" : "secondary"}>
                          {group.required ? "REQUIRED" : "OPTIONAL"}
                        </Badge>
                        <Badge variant={getOptionStatusBadgeVariant(group.status)}>
                          {group.status}
                        </Badge>
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
                            <Badge
                              key={value.productOptionValueId}
                              variant={getOptionStatusBadgeVariant(value.status)}
                            >
                              {displayLabel}
                              {priceDeltaText} - {value.status}
                            </Badge>
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
            <div className="grid gap-3 md:grid-cols-3">
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
              <div className="space-y-2">
                <Label>Step Order</Label>
                <Input
                  type="number"
                  min={1}
                  value={stepOrder}
                  onChange={(e) => setStepOrder(Number(e.target.value || 1))}
                />
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
                disabled={!selectedGlobalGroupId || isSubmittingGroup}
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
                disabled={!selectedProductOptionGroupId || isSubmittingValues}
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