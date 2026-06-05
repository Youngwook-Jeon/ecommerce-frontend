import type {
  PublicProductDetailVm,
  PublicProductStatus,
  PublicProductVariantVm,
} from "@/common/schemas/publicProductDetail";

/** Mirrors backend {@code StorefrontProductVisibilityPolicy}. */
export function isStorefrontDetailViewable(status: PublicProductStatus): boolean {
  return status !== "DRAFT" && status !== "DELETED";
}

export function isStorefrontListedInCatalog(status: PublicProductStatus): boolean {
  return status === "ACTIVE";
}

export function isStorefrontPurchasable(status: PublicProductStatus): boolean {
  return status === "ACTIVE";
}

export interface AddToCartUiState {
  enabled: boolean;
  label: string;
}

/**
 * PDP add-to-cart CTA — never surfaces raw {@link PublicProductStatus} strings.
 * Only ACTIVE may enable; INACTIVE and all other viewable statuses stay disabled.
 */
export function getAddToCartUiState(
  detail: PublicProductDetailVm,
  selectedVariant: PublicProductVariantVm | undefined,
  options?: { hasOptionGroups?: boolean }
): AddToCartUiState {
  const { status } = detail;
  const hasOptionGroups = options?.hasOptionGroups ?? detail.optionGroups.length > 0;

  if (status !== "ACTIVE" && status !== "INACTIVE") {
    if (status === "OUT_OF_STOCK") {
      return { enabled: false, label: "Out of stock" };
    }
    if (status === "DISCONTINUED") {
      return { enabled: false, label: "No longer available" };
    }
    return { enabled: false, label: "Unavailable" };
  }

  if (status === "INACTIVE") {
    return { enabled: false, label: "Coming soon" };
  }

  if (!detail.purchasable) {
    return { enabled: false, label: "Unavailable" };
  }

  if (hasOptionGroups && !selectedVariant) {
    return { enabled: false, label: "Select options" };
  }

  if (selectedVariant && selectedVariant.stockQuantity <= 0) {
    return { enabled: false, label: "Out of stock" };
  }

  return { enabled: true, label: "Add to cart" };
}
