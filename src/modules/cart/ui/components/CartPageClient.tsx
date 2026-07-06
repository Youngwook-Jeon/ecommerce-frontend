"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LuMinus, LuPlus, LuTrash2 } from "react-icons/lu";

import type { CartSyncChangeVm, CartVm } from "@/common/schemas/cart";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCartPrice } from "@/modules/cart/lib/formatCartPrice";
import { notifyCartBadgeUpdated } from "@/modules/cart/lib/cartBadgeSync";
import {
  clearCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/services/cartService";

interface CartPageClientProps {
  initialCart: CartVm;
  syncChanges: CartSyncChangeVm[];
}

function formatVariantOptions(item: CartVm["items"][number]): string {
  if (item.variantOptions.length === 0) {
    return "";
  }
  return item.variantOptions
    .slice()
    .sort((left, right) => left.stepOrder - right.stepOrder)
    .map((option) => `${option.optionGroupName}: ${option.optionValueName}`)
    .join(" · ");
}

function describeSyncChange(change: CartSyncChangeVm): string {
  switch (change.type) {
    case "PRICE_UPDATED":
      return "Price updated to reflect the latest catalog price.";
    case "SNAPSHOT_UPDATED":
      return "Product details were refreshed.";
    case "QUANTITY_ADJUSTED":
      return `Quantity adjusted from ${change.previousQuantity} to ${change.currentQuantity} due to stock limits.`;
    case "REMOVED":
      return `${change.productName ?? "An item"} was removed (${change.removalReason?.replaceAll("_", " ").toLowerCase()}).`;
    default:
      return "Cart was updated.";
  }
}

export function CartPageClient({ initialCart, syncChanges }: CartPageClientProps) {
  const router = useRouter();
  const [cart, setCart] = useState(initialCart);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const runMutation = (mutation: () => Promise<CartVm>) => {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const nextCart = await mutation();
        setCart(nextCart);
        notifyCartBadgeUpdated(nextCart);
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to update your cart."
        );
      }
    });
  };

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Your cart is empty</h1>
        <p className="text-muted-foreground">
          Browse products and add items to see them here.
        </p>
        <Button asChild>
          <Link href="/categories">Start shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Shopping cart</h1>
        <p className="text-sm text-muted-foreground">
          {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"} ·{" "}
          {cart.totalQuantity} total units
        </p>
      </div>

      {syncChanges.length > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-medium">We updated your cart to match the latest catalog.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {syncChanges.map((change) => (
              <li key={`${change.type}-${change.itemId}`}>
                {describeSyncChange(change)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          {cart.items.map((item) => {
            const optionLabel = formatVariantOptions(item);
            return (
              <div
                key={item.itemId}
                className="flex gap-4 rounded-xl border p-4"
              >
                <Link
                  href={`/products/${item.productId}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted"
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="space-y-1">
                    {item.brand ? (
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {item.brand}
                      </p>
                    ) : null}
                    <Link
                      href={`/products/${item.productId}`}
                      className="line-clamp-2 font-medium hover:underline"
                    >
                      {item.productName}
                    </Link>
                    {optionLabel ? (
                      <p className="text-sm text-muted-foreground">{optionLabel}</p>
                    ) : null}
                    <p className="text-sm text-muted-foreground">
                      {formatCartPrice(item.unitPrice)} each
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={isPending || item.quantity <= 1}
                        onClick={() =>
                          runMutation(() =>
                            updateCartItemQuantity(item.itemId, item.quantity - 1)
                          )
                        }
                        aria-label="Decrease quantity"
                      >
                        <LuMinus />
                      </Button>
                      <span className="min-w-8 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={isPending}
                        onClick={() =>
                          runMutation(() =>
                            updateCartItemQuantity(item.itemId, item.quantity + 1)
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        <LuPlus />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="font-semibold">{formatCartPrice(item.lineAmount)}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isPending}
                        onClick={() => runMutation(() => removeCartItem(item.itemId))}
                        aria-label="Remove item"
                      >
                        <LuTrash2 />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <Separator className="my-4" />
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCartPrice(cart.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="text-muted-foreground">Calculated at checkout</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Estimated total</span>
            <span>{formatCartPrice(cart.subtotal)}</span>
          </div>
          <Button className="mt-6 w-full" disabled>
            Checkout coming soon
          </Button>
          <Button
            type="button"
            variant="outline"
            className="mt-3 w-full"
            disabled={isPending}
            onClick={() => runMutation(clearCart)}
          >
            Clear cart
          </Button>
        </aside>
      </div>
    </div>
  );
}
