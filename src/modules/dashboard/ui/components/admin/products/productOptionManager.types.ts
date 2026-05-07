import { Dispatch, DragEvent, SetStateAction } from "react";

import { OptionGroupVm } from "@/common/schemas/optionGroup";
import {
  AdminProductDetailVm,
  ProductOptionGroupVm,
  ProductVariantVm,
} from "@/services/productService";

export type OptionSelectionConfig = {
  selected: boolean;
  priceDelta: number;
  isDefault: boolean;
};

export interface VariantGroupItem {
  group: ProductOptionGroupVm;
  globalGroup: OptionGroupVm | null;
  optionValues: ProductOptionGroupVm["optionValues"];
}

export interface OptionGroupsTabProps {
  isLoading: boolean;
  detail: AdminProductDetailVm | null;
  orderedGroups: ProductOptionGroupVm[];
  globalOptionGroups: OptionGroupVm[];
  isDraftProduct: boolean;
  isReordering: boolean;
  isDeletingGroupId: string | null;
  isDeletingValueId: string | null;
  selectedGlobalGroupId: string;
  globalGroupsForCreate: OptionGroupVm[];
  required: boolean;
  selectedGlobalGroup: OptionGroupVm | null;
  selectedCountForNewGroup: number;
  newGroupSelection: Record<string, OptionSelectionConfig>;
  isSubmittingGroup: boolean;
  selectedProductOptionGroupId: string;
  selectedLocalGroup: ProductOptionGroupVm | null;
  availableOptionValuesForLocal: OptionGroupVm["optionValues"];
  selectedCountForExisting: number;
  existingGroupSelection: Record<string, OptionSelectionConfig>;
  canAddOptionValues: boolean;
  isSubmittingValues: boolean;
  setDraggingGroupId: Dispatch<SetStateAction<string | null>>;
  setRequired: Dispatch<SetStateAction<boolean>>;
  onDragOverGroup: (e: DragEvent<HTMLDivElement>, targetId: string) => void;
  onDeleteOptionGroup: (productOptionGroupId: string) => void;
  onDeleteOptionValue: (productOptionValueId: string) => void;
  onSaveGroupOrder: () => void;
  onSelectGlobalGroup: (value: string) => void;
  onToggleNewGroupValue: (optionValueId: string, checked: boolean) => void;
  onChangeNewGroupSelectionField: (
    optionValueId: string,
    patch: Partial<OptionSelectionConfig>
  ) => void;
  onAddGroup: () => void;
  onSelectProductOptionGroup: (value: string) => void;
  onToggleExistingGroupValue: (optionValueId: string, checked: boolean) => void;
  onChangeExistingGroupSelectionField: (
    optionValueId: string,
    patch: Partial<OptionSelectionConfig>
  ) => void;
  onAddValuesToGroup: () => void;
}

export interface VariantsTabProps {
  isDraftProduct: boolean;
  variantGroups: VariantGroupItem[];
  variantSelectionsByGroup: Record<string, string>;
  optionValueLabelByProductOptionValueId: Map<string, string>;
  variantStockQuantity: number;
  canAddVariants: boolean;
  isSubmittingVariant: boolean;
  cartesianSelectionsByGroup: Record<string, Record<string, boolean>>;
  missingRequiredGroupsForCartesian: string[];
  bulkVariantStockQuantity: number;
  rawCartesianCombinationCount: number;
  cartesianCombinationsForCreate: string[][];
  skippedExistingCombinationCount: number;
  cartesianPreviewRows: string[];
  isSubmittingVariantBulk: boolean;
  isVariantsLoading: boolean;
  visibleVariants: ProductVariantVm[];
  variantStockEdits: Record<string, number>;
  variantStatusEdits: Record<string, string>;
  editableVariantStatuses: string[];
  isUpdatingVariantId: string | null;
  isDeletingVariantId: string | null;
  setVariantSelectionsByGroup: Dispatch<SetStateAction<Record<string, string>>>;
  setVariantStockQuantity: Dispatch<SetStateAction<number>>;
  toggleCartesianSelection: (
    productOptionGroupId: string,
    productOptionValueId: string,
    checked: boolean
  ) => void;
  setBulkVariantStockQuantity: Dispatch<SetStateAction<number>>;
  onAddVariant: () => void;
  onAddVariantCartesian: () => void;
  setVariantStockEdits: Dispatch<SetStateAction<Record<string, number>>>;
  setVariantStatusEdits: Dispatch<SetStateAction<Record<string, string>>>;
  onUpdateVariant: (variantId: string) => void;
  onDeleteVariant: (variantId: string) => void;
}
