"use client";

import { Dispatch, DragEvent, SetStateAction, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { OptionGroupVm } from "@/common/schemas/optionGroup";
import { getAdminOptionGroups } from "@/services/optionGroupService";
import {
  addProductVariants,
  deleteProductVariant,
  addProductOptionGroup,
  addProductOptionValues,
  AdminProductDetailVm,
  AdminProductDtoVm,
  ProductOptionGroupVm,
  deleteProductOptionGroup,
  deleteProductOptionValue,
  getAdminProductDetail,
  getAdminProductVariants,
  reorderProductOptionGroups,
  ProductVariantVm,
  updateProductVariant,
} from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OptionGroupsTab } from "./OptionGroupsTab";
import {
  OptionGroupsTabProps,
  OptionSelectionConfig,
  VariantsTabProps,
} from "./productOptionManager.types";
import { VariantsTab } from "./VariantsTab";

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

const MAX_CARTESIAN_VARIANT_BATCH_SIZE = 200;

export function ProductOptionManagerDialog({
  product,
  isOpen,
  onClose,
}: ProductOptionManagerDialogProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [detail, setDetail] = useState<AdminProductDetailVm | null>(null);
  const [globalOptionGroups, setGlobalOptionGroups] = useState<OptionGroupVm[]>([]);
  const [variants, setVariants] = useState<ProductVariantVm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVariantsLoading, setIsVariantsLoading] = useState(false);
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);
  const [isSubmittingValues, setIsSubmittingValues] = useState(false);
  const [isSubmittingVariant, setIsSubmittingVariant] = useState(false);
  const [isDeletingGroupId, setIsDeletingGroupId] = useState<string | null>(null);
  const [isDeletingValueId, setIsDeletingValueId] = useState<string | null>(null);
  const [isUpdatingVariantId, setIsUpdatingVariantId] = useState<string | null>(null);
  const [isDeletingVariantId, setIsDeletingVariantId] = useState<string | null>(null);
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
  const [variantStockQuantity, setVariantStockQuantity] = useState<number>(0);
  const [variantSelectionsByGroup, setVariantSelectionsByGroup] = useState<
    Record<string, string>
  >({});
  const [bulkVariantStockQuantity, setBulkVariantStockQuantity] = useState<number>(0);
  const [isSubmittingVariantBulk, setIsSubmittingVariantBulk] = useState(false);
  const [variantStockEdits, setVariantStockEdits] = useState<Record<string, number>>({});
  const [variantStatusEdits, setVariantStatusEdits] = useState<Record<string, string>>({});
  const [cartesianSelectionsByGroup, setCartesianSelectionsByGroup] = useState<
    Record<string, Record<string, boolean>>
  >({});

  const refreshData = async () => {
    if (!product) return;
    setIsLoading(true);
    setIsVariantsLoading(true);
    const [detailResult, globalGroups, variantsResult] = await Promise.all([
      getAdminProductDetail(product.id),
      getAdminOptionGroups(),
      getAdminProductVariants(product.id),
    ]);
    setDetail(detailResult);
    setGlobalOptionGroups(globalGroups.filter((group) => group.status !== "DELETED"));
    setVariants(variantsResult ?? []);
    setIsLoading(false);
    setIsVariantsLoading(false);
  };

  useEffect(() => {
    if (!isOpen || !product) return;
    void refreshData();
    setSelectedGlobalGroupId("");
    setSelectedProductOptionGroupId("");
    setNewGroupSelection({});
    setExistingGroupSelection({});
    setVariantSelectionsByGroup({});
    setVariantStockQuantity(0);
    setBulkVariantStockQuantity(0);
    setVariantStockEdits({});
    setVariantStatusEdits({});
    setCartesianSelectionsByGroup({});
    setRequired(true);
    setVariants([]);
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

  const optionValueLabelByProductOptionValueId = useMemo(() => {
    const map = new Map<string, string>();

    for (const localGroup of detail?.optionGroups ?? []) {
      const globalGroup = globalOptionGroups.find(
        (g) => g.id === localGroup.optionGroupId
      );

      for (const value of localGroup.optionValues) {
        const globalValue = globalGroup?.optionValues.find(
          (ov) => ov.id === value.optionValueId
        );

        map.set(
          value.productOptionValueId,
          globalValue
            ? `${globalValue.displayName} (${globalValue.value})`
            : value.optionValueId
        );
      }
    }

    return map;
  }, [detail, globalOptionGroups]);

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
  const canAddOptionValues = product?.status !== "DELETED";
  const canAddVariants = product?.status !== "DELETED";
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

  const variantGroups = useMemo(
    () =>
      orderedGroups
        .filter((group) => group.status !== "DELETED")
        .map((group) => ({
          group,
          globalGroup:
            globalOptionGroups.find((g) => g.id === group.optionGroupId) ?? null,
          optionValues: group.optionValues.filter((value) => value.status !== "DELETED"),
        })),
    [orderedGroups, globalOptionGroups]
  );

  const existingActiveVariantCombinationKeys = useMemo(() => {
    return new Set(
      variants
        .filter((variant) => variant.status !== "DELETED")
        .map((variant) =>
        [...variant.selectedProductOptionValueIds].sort().join("|")
      )
    );
  }, [variants]);

  const cartesianSelectedValueIdsByGroup = useMemo(() => {
    return variantGroups.map(({ group, optionValues }) => {
      const selectedMap = cartesianSelectionsByGroup[group.productOptionGroupId] ?? {};
      const selectedIds = optionValues
        .filter((value) => selectedMap[value.productOptionValueId])
        .map((value) => value.productOptionValueId);
      return {
        groupId: group.productOptionGroupId,
        selectedIds,
      };
    });
  }, [variantGroups, cartesianSelectionsByGroup]);

  const rawCartesianCombinationCount = useMemo(() => {
    const selectedGroups = cartesianSelectedValueIdsByGroup.filter(
      (entry) => entry.selectedIds.length > 0
    );
    if (selectedGroups.length === 0) return 0;
    return selectedGroups.reduce((acc, entry) => acc * entry.selectedIds.length, 1);
  }, [cartesianSelectedValueIdsByGroup]);

  const cartesianCombinationsForCreate = useMemo(() => {
    const selectedGroups = cartesianSelectedValueIdsByGroup.filter(
      (entry) => entry.selectedIds.length > 0
    );
    if (selectedGroups.length === 0) return [];

    let combinations: string[][] = [[]];
    for (const entry of selectedGroups) {
      const next: string[][] = [];
      for (const base of combinations) {
        for (const selectedId of entry.selectedIds) {
          next.push([...base, selectedId]);
          if (next.length >= MAX_CARTESIAN_VARIANT_BATCH_SIZE) {
            break;
          }
        }
        if (next.length >= MAX_CARTESIAN_VARIANT_BATCH_SIZE) {
          break;
        }
      }
      combinations = next;
      if (combinations.length >= MAX_CARTESIAN_VARIANT_BATCH_SIZE) {
        break;
      }
    }

    return combinations.filter((combo) => {
      const key = [...combo].sort().join("|");
      return !existingActiveVariantCombinationKeys.has(key);
    });
  }, [cartesianSelectedValueIdsByGroup, existingActiveVariantCombinationKeys]);

  const skippedExistingCombinationCount = useMemo(() => {
    if (rawCartesianCombinationCount <= 0) return 0;
    const created = cartesianCombinationsForCreate.length;
    return Math.max(rawCartesianCombinationCount - created, 0);
  }, [rawCartesianCombinationCount, cartesianCombinationsForCreate.length]);

  const missingRequiredGroupsForCartesian = useMemo(() => {
    const selectedCountByGroup = new Map(
      cartesianSelectedValueIdsByGroup.map((entry) => [entry.groupId, entry.selectedIds.length])
    );
    return variantGroups
      .filter(({ group }) => group.required)
      .filter(
        ({ group }) => (selectedCountByGroup.get(group.productOptionGroupId) ?? 0) === 0
      )
      .map(({ group, globalGroup }) =>
        globalGroup ? `${globalGroup.displayName} (${globalGroup.name})` : group.optionGroupId
      );
  }, [cartesianSelectedValueIdsByGroup, variantGroups]);

  const cartesianPreviewRows = useMemo(() => {
    return cartesianCombinationsForCreate.slice(0, 10).map((combo) =>
      combo
        .map((id) => optionValueLabelByProductOptionValueId.get(id) ?? id)
        .join(" / ")
    );
  }, [cartesianCombinationsForCreate, optionValueLabelByProductOptionValueId]);
  const visibleVariants = useMemo(
    () => variants.filter((variant) => variant.status !== "DELETED"),
    [variants]
  );

  const editableVariantStatuses = ["ACTIVE", "INACTIVE", "OUT_OF_STOCK"];

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

  const handleSelectGlobalGroup = (value: string) => {
    setSelectedGlobalGroupId(value);
    setNewGroupSelection({});
  };

  const handleSelectProductOptionGroup = (value: string) => {
    setSelectedProductOptionGroupId(value);
    setExistingGroupSelection({});
  };

  const handleChangeNewGroupSelectionField = (
    optionValueId: string,
    patch: Partial<OptionSelectionConfig>
  ) => {
    onChangeSelectionField(setNewGroupSelection, optionValueId, patch);
  };

  const handleChangeExistingGroupSelectionField = (
    optionValueId: string,
    patch: Partial<OptionSelectionConfig>
  ) => {
    onChangeSelectionField(setExistingGroupSelection, optionValueId, patch);
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

  const handleAddVariant = async () => {
    if (!product || !canAddVariants) return;

    const selectedProductOptionValueIds = Object.values(variantSelectionsByGroup).filter(
      Boolean
    );
    if (selectedProductOptionValueIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Selection required",
        description: "Select at least one option value to create a variant.",
      });
      return;
    }

    setIsSubmittingVariant(true);
    const result = await addProductVariants(product.id, {
      variants: [
        {
          stockQuantity: variantStockQuantity,
          selectedProductOptionValueIds,
        },
      ],
    });
    setIsSubmittingVariant(false);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Failed to add variant",
        description: result.message,
      });
      return;
    }

    toast({
      title: "Variant added",
      description: "A new product variant has been created.",
    });
    setVariantSelectionsByGroup({});
    setVariantStockQuantity(0);
    await refreshData();
    router.refresh();
  };

  const toggleCartesianSelection = (
    productOptionGroupId: string,
    productOptionValueId: string,
    checked: boolean
  ) => {
    setCartesianSelectionsByGroup((prev) => ({
      ...prev,
      [productOptionGroupId]: {
        ...(prev[productOptionGroupId] ?? {}),
        [productOptionValueId]: checked,
      },
    }));
  };

  const handleAddVariantCartesian = async () => {
    if (!product || !canAddVariants) return;
    if (missingRequiredGroupsForCartesian.length > 0) {
      toast({
        variant: "destructive",
        title: "Required group selection missing",
        description: `Select at least one option value for required groups: ${missingRequiredGroupsForCartesian.join(", ")}`,
      });
      return;
    }
    if (cartesianCombinationsForCreate.length === 0) {
      toast({
        variant: "destructive",
        title: "No combinations to add",
        description:
          rawCartesianCombinationCount > 0
            ? "All selected combinations already exist, or the generated batch is empty."
            : "Select at least one option value in each target group.",
      });
      return;
    }

    setIsSubmittingVariantBulk(true);
    const result = await addProductVariants(product.id, {
      variants: cartesianCombinationsForCreate.map((selectedProductOptionValueIds) => ({
        stockQuantity: bulkVariantStockQuantity,
        selectedProductOptionValueIds,
      })),
    });
    setIsSubmittingVariantBulk(false);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Failed to generate variants",
        description: result.message,
      });
      return;
    }

    toast({
      title: "Variants generated",
      description:
        skippedExistingCombinationCount > 0
          ? `${cartesianCombinationsForCreate.length} variants created, ${skippedExistingCombinationCount} existing active combinations skipped.`
          : `${cartesianCombinationsForCreate.length} variants were created from selected combinations.`,
    });
    setCartesianSelectionsByGroup({});
    setBulkVariantStockQuantity(0);
    await refreshData();
    router.refresh();
  };

  const handleUpdateVariant = async (variantId: string) => {
    if (!product) return;
    const variant = variants.find((v) => v.productVariantId === variantId);
    if (!variant) return;

    const stockQuantity = variantStockEdits[variantId] ?? variant.stockQuantity;
    const status = variantStatusEdits[variantId] ?? variant.status;

    setIsUpdatingVariantId(variantId);
    const result = await updateProductVariant(product.id, variantId, {
      stockQuantity,
      status,
    });
    setIsUpdatingVariantId(null);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Failed to update variant",
        description: result.message,
      });
      return;
    }

    toast({
      title: "Variant updated",
      description: "Stock and status were updated.",
    });
    await refreshData();
    router.refresh();
  };

  const handleDeleteVariant = async (variantId: string) => {
    if (!product) return;
    if (!window.confirm("This variant will be soft-deleted. Continue?")) return;

    setIsDeletingVariantId(variantId);
    const result = await deleteProductVariant(product.id, variantId);
    setIsDeletingVariantId(null);

    if (!result.success) {
      toast({
        variant: "destructive",
        title: "Failed to delete variant",
        description: result.message,
      });
      return;
    }

    toast({
      title: "Variant deleted",
      description: "The variant was soft-deleted.",
    });
    await refreshData();
    router.refresh();
  };

  const optionGroupsTabProps: OptionGroupsTabProps = {
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
    setRequired,
    onDragOverGroup: handleDragOverGroup,
    onDeleteOptionGroup: handleDeleteOptionGroup,
    onDeleteOptionValue: handleDeleteOptionValue,
    onSaveGroupOrder: handleSaveGroupOrder,
    onSelectGlobalGroup: handleSelectGlobalGroup,
    onToggleNewGroupValue,
    onChangeNewGroupSelectionField: handleChangeNewGroupSelectionField,
    onAddGroup: handleAddGroup,
    onSelectProductOptionGroup: handleSelectProductOptionGroup,
    onToggleExistingGroupValue,
    onChangeExistingGroupSelectionField: handleChangeExistingGroupSelectionField,
    onAddValuesToGroup: handleAddValuesToGroup,
  };

  const variantsTabProps: VariantsTabProps = {
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
    onAddVariant: handleAddVariant,
    onAddVariantCartesian: handleAddVariantCartesian,
    setVariantStockEdits,
    setVariantStatusEdits,
    onUpdateVariant: handleUpdateVariant,
    onDeleteVariant: handleDeleteVariant,
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
            Adding option values and variants is available for all non-DELETED product statuses.
          </div>
        ) : null}

        <Tabs defaultValue="optionGroups" className="w-full">
          <TabsList>
            <TabsTrigger value="optionGroups">Option Groups</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
          </TabsList>

          <OptionGroupsTab {...optionGroupsTabProps} />

          <VariantsTab {...variantsTabProps} />
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}