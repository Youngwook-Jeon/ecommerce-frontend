"use client";

import type { CartVm } from "@/common/schemas/cart";
import { bootstrapGatewaySession } from "@/common/lib/gatewaySession";
import { getCurrentCartSafe } from "@/services/cartService";

type CartBadgeListener = (cart: CartVm) => void;

const listeners = new Set<CartBadgeListener>();

export function subscribeCartBadge(listener: CartBadgeListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyCartBadgeUpdated(cart: CartVm): void {
  for (const listener of listeners) {
    listener(cart);
  }
}

export async function loadCartBadge(): Promise<CartVm> {
  await bootstrapGatewaySession();
  return getCurrentCartSafe();
}
