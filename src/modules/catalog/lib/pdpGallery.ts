import type {
  PublicProductDetailVm,
  PublicProductImageVm,
  PublicProductOptionGroupVm,
  PublicProductOptionValueVm,
  PublicProductVariantVm,
} from "@/common/schemas/publicProductDetail";

export type PdpGallerySource = "pov" | "variant" | "product";

export interface PdpGalleryImage {
  id: string;
  url: string;
}

export interface PdpGallery {
  images: PdpGalleryImage[];
  source: PdpGallerySource;
}

function toGalleryImages(images: PublicProductImageVm[]): PdpGalleryImage[] {
  return images.map((image) => ({ id: image.id, url: image.url }));
}

export function findVisualOptionGroup(
  sortedGroups: PublicProductOptionGroupVm[]
): PublicProductOptionGroupVm | undefined {
  return sortedGroups.find((group) => group.drivesVariantImages);
}

function findSelectedOptionValue(
  group: PublicProductOptionGroupVm,
  selectedByGroup: Record<string, string>
): PublicProductOptionValueVm | undefined {
  const selectedId = selectedByGroup[group.productOptionGroupId];
  if (!selectedId) {
    return undefined;
  }
  return group.optionValues.find(
    (value) => value.productOptionValueId === selectedId
  );
}

/**
 * Variant-specific imagery is shown only after the visual group is chosen.
 * Products without a visual group may use variant imagery once resolved.
 */
function canUseVariantGallery(
  sortedGroups: PublicProductOptionGroupVm[],
  selectedByGroup: Record<string, string>
): boolean {
  const visualGroup = findVisualOptionGroup(sortedGroups);
  if (!visualGroup) {
    return true;
  }
  return Boolean(selectedByGroup[visualGroup.productOptionGroupId]);
}

/**
 * PDP main gallery source priority:
 * 1. Selected POV images from the visual option group (drivesVariantImages), once chosen
 * 2. Resolved variant mainImageUrl (only after the visual group is selected, if any)
 * 3. Product-level gallery
 * 4. Product mainImageUrl fallback
 */
export function resolvePdpGallery(
  detail: PublicProductDetailVm,
  sortedGroups: PublicProductOptionGroupVm[],
  selectedByGroup: Record<string, string>,
  selectedVariant: PublicProductVariantVm | undefined
): PdpGallery {
  const visualGroup = findVisualOptionGroup(sortedGroups);
  const visualSelected =
    visualGroup != null &&
    Boolean(selectedByGroup[visualGroup.productOptionGroupId]);

  if (visualGroup && visualSelected) {
    const selectedValue = findSelectedOptionValue(visualGroup, selectedByGroup);
    if (selectedValue && selectedValue.images.length > 0) {
      return {
        images: toGalleryImages(selectedValue.images),
        source: "pov",
      };
    }
  }

  if (canUseVariantGallery(sortedGroups, selectedByGroup) && selectedVariant?.mainImageUrl) {
    return {
      images: [
        {
          id: `variant-${selectedVariant.productVariantId}`,
          url: selectedVariant.mainImageUrl,
        },
      ],
      source: "variant",
    };
  }

  if (detail.images.length > 0) {
    return {
      images: toGalleryImages(detail.images),
      source: "product",
    };
  }

  if (detail.mainImageUrl) {
    return {
      images: [{ id: "main", url: detail.mainImageUrl }],
      source: "product",
    };
  }

  return { images: [], source: "product" };
}

/** Keeps the active thumbnail when still valid; otherwise falls back to the first gallery image. */
export function resolveActiveGalleryUrl(
  gallery: PdpGallery,
  activeImageUrl: string | null
): string | null {
  if (
    activeImageUrl &&
    gallery.images.some((image) => image.url === activeImageUrl)
  ) {
    return activeImageUrl;
  }
  return gallery.images[0]?.url ?? null;
}

export function galleryIdentity(gallery: PdpGallery): string {
  return `${gallery.source}:${gallery.images.map((image) => image.id).join("|")}`;
}
