/** Aligns with product-service storefront PDP Redis TTL (seconds). */
export const STOREFRONT_PDP_REVALIDATE_SECONDS = 900;

/** Storefront category hierarchy ISR (seconds). */
export const STOREFRONT_CATEGORY_REVALIDATE_SECONDS = 3600;

export interface StorefrontPublicGetCacheOptions {
  revalidate: number;
  tags: string[];
}

type StorefrontPublicGetInit =
  | { cache: "no-store" }
  | { next: { revalidate: number; tags: string[] } };

/** ISR is enabled in production only so local admin edits are visible immediately. */
export function isStorefrontFetchCacheEnabled(): boolean {
  return process.env.NODE_ENV === "production";
}

export function resolveStorefrontPublicGetInit(
  options: StorefrontPublicGetCacheOptions
): StorefrontPublicGetInit {
  if (!isStorefrontFetchCacheEnabled()) {
    return { cache: "no-store" };
  }

  return {
    next: {
      revalidate: options.revalidate,
      tags: options.tags,
    },
  };
}
