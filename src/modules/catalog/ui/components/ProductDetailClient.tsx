"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  isPublicProductPreview,
  type PublicProductDetailVm,
  type PublicProductOptionGroupVm,
  type PublicProductOptionValueVm,
} from "@/common/schemas/publicProductDetail";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import {
  applyOptionSelection,
  buildInitialSelection,
  getSelectableValues,
  isGroupUnlocked,
  resolveSelectedVariant,
  sortOptionGroups,
} from "@/modules/catalog/lib/pdpOptionSelection";
import {
  galleryIdentity,
  resolveActiveGalleryUrl,
  resolvePdpGallery,
} from "@/modules/catalog/lib/pdpGallery";
import { getAddToCartUiState } from "@/modules/catalog/lib/storefrontProductVisibility";
import { addCartItem } from "@/services/cartService";

interface ProductDetailClientProps {
  detail: PublicProductDetailVm;
}

function optionGroupLabel(group: PublicProductOptionGroupVm): string {
  return group.displayName ?? group.groupKey ?? "Option";
}

function optionValueLabel(value: PublicProductOptionValueVm): string {
  return value.displayName ?? "—";
}

function formatPrice(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function ProductDetailClient({ detail }: ProductDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isAdding, startAddTransition] = useTransition();
  const sortedGroups = useMemo(
    () => sortOptionGroups(detail.optionGroups),
    [detail.optionGroups]
  );

  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string>>(
    () => buildInitialSelection(detail)
  );
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);

  const selectedVariant = useMemo(
    () => resolveSelectedVariant(sortedGroups, detail.variants, selectedByGroup),
    [sortedGroups, detail.variants, selectedByGroup]
  );

  const gallery = useMemo(
    () =>
      resolvePdpGallery(detail, sortedGroups, selectedByGroup, selectedVariant),
    [detail, sortedGroups, selectedByGroup, selectedVariant]
  );

  const galleryKey = useMemo(() => galleryIdentity(gallery), [gallery]);

  useEffect(() => {
    setActiveImageUrl(gallery.images[0]?.url ?? null);
  }, [galleryKey, gallery]);

  const displayImageUrl = resolveActiveGalleryUrl(gallery, activeImageUrl);

  const currentPrice = selectedVariant?.calculatedPrice ?? detail.basePrice;
  const addToCart = getAddToCartUiState(detail, selectedVariant, {
    hasOptionGroups: sortedGroups.length > 0,
  });

  const handleAddToCart = () => {
    if (!addToCart.enabled || isAdding) {
      return;
    }

    const productVariantId = selectedVariant?.productVariantId;
    if (!productVariantId) {
      toast({
        variant: "destructive",
        title: "Unable to add to cart",
        description: "Select all required options before adding this product.",
      });
      return;
    }

    startAddTransition(async () => {
      try {
        await addCartItem({
          productId: detail.id,
          productVariantId,
          quantity: 1,
        });
        router.refresh();
        toast({
          title: "Added to cart",
          description: `${detail.name} was added to your cart.`,
          action: (
            <ToastAction altText="View cart" asChild>
              <Link href="/cart">View cart</Link>
            </ToastAction>
          ),
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Unable to add to cart",
          description:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        });
      }
    });
  };

  const handleSelect = (groupId: string, valueId: string) => {
    setSelectedByGroup((prev) =>
      applyOptionSelection(sortedGroups, prev, groupId, valueId)
    );
  };

  const isPreview = isPublicProductPreview(detail);

  return (
    <div className="space-y-6">
      {isPreview ? (
        <Alert className="border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-50">
          <AlertTitle>Coming soon</AlertTitle>
          <AlertDescription>
            This product is not available for purchase yet. You can preview it here
            before launch.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(320px,480px)_1fr]">
      <section>
        <div className="overflow-hidden rounded-lg border bg-muted">
          {displayImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={displayImageUrl}
              alt={detail.name}
              className="aspect-square h-full w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
        </div>
        {gallery.images.length > 1 ? (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {gallery.images.map((image) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveImageUrl(image.url)}
                className={`overflow-hidden rounded border bg-muted ${
                  displayImageUrl === image.url ? "ring-2 ring-primary" : ""
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={`${detail.name} thumbnail`}
                  className="aspect-square h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-5">
        <div className="space-y-2">
          {detail.brand ? (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{detail.brand}</Badge>
            </div>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-tight">{detail.name}</h1>
          <p className="text-2xl font-semibold">{formatPrice(currentPrice)}</p>
          {selectedVariant ? (
            <p className="text-sm text-muted-foreground">
              SKU: {selectedVariant.sku}
            </p>
          ) : null}
        </div>

        {detail.description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {detail.description}
          </p>
        ) : null}

        {sortedGroups.length > 0 ? (
          <div className="space-y-4">
            {sortedGroups.map((group, groupIndex) => {
              const unlocked = isGroupUnlocked(
                sortedGroups,
                selectedByGroup,
                groupIndex
              );
              const selectableValues = unlocked
                ? getSelectableValues(
                    sortedGroups,
                    detail.variants,
                    selectedByGroup,
                    groupIndex
                  )
                : [];

              return (
                <OptionGroupSection
                  key={group.productOptionGroupId}
                  group={group}
                  unlocked={unlocked}
                  selectableValues={selectableValues}
                  selectedValueId={selectedByGroup[group.productOptionGroupId]}
                  onSelect={(valueId) =>
                    handleSelect(group.productOptionGroupId, valueId)
                  }
                />
              );
            })}
          </div>
        ) : null}

        <Button
          size="lg"
          className="w-full sm:w-auto"
          disabled={!addToCart.enabled || isAdding}
          onClick={handleAddToCart}
        >
          {isAdding ? "Adding..." : addToCart.label}
        </Button>
      </section>
      </div>
    </div>
  );
}

interface OptionGroupSectionProps {
  group: PublicProductOptionGroupVm;
  unlocked: boolean;
  selectableValues: PublicProductOptionValueVm[];
  selectedValueId?: string;
  onSelect: (valueId: string) => void;
}

function OptionGroupSection({
  group,
  unlocked,
  selectableValues,
  selectedValueId,
  onSelect,
}: OptionGroupSectionProps) {
  return (
    <div
      className={`space-y-2 ${unlocked ? "" : "opacity-50"}`}
      aria-disabled={!unlocked}
    >
      <p className="text-sm font-medium">
        {optionGroupLabel(group)}
        {group.required ? (
          <span className="ml-1 text-xs text-muted-foreground">(required)</span>
        ) : null}
        {!unlocked ? (
          <span className="ml-1 text-xs text-muted-foreground">
            · Select previous options first
          </span>
        ) : null}
      </p>
      <div className="flex flex-wrap gap-2">
        {group.optionValues.map((value) => {
          const selected = selectedValueId === value.productOptionValueId;
          const available = selectableValues.some(
            (candidate) => candidate.productOptionValueId === value.productOptionValueId
          );
          const disabled = !unlocked || !available;

          return (
            <button
              key={value.productOptionValueId}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(value.productOptionValueId)}
              className={`rounded border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background hover:bg-muted disabled:hover:bg-background"
              }`}
            >
              {optionValueLabel(value)}
              {value.priceDelta !== 0
                ? ` (${value.priceDelta > 0 ? "+" : ""}${formatPrice(value.priceDelta)})`
                : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
