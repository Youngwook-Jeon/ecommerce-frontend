"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LuShoppingCart } from "react-icons/lu";

import { EMPTY_CART, type CartVm } from "@/common/schemas/cart";
import { Button } from "@/components/ui/button";
import {
  loadCartBadge,
  subscribeCartBadge,
} from "@/modules/cart/lib/cartBadgeSync";

export default function CartButton() {
  const [cart, setCart] = useState<CartVm>(EMPTY_CART);

  useEffect(() => subscribeCartBadge(setCart), []);

  useEffect(() => {
    void loadCartBadge()
      .then(setCart)
      .catch((error) => {
        console.error("Failed to load cart badge:", error);
      });
  }, []);

  const badgeCount = cart.totalQuantity;

  return (
    <Button
      asChild
      variant="outline"
      size="icon"
      className="relative flex items-center justify-center"
    >
      <Link href="/cart" aria-label="Shopping cart">
        <LuShoppingCart />
        {badgeCount > 0 ? (
          <span className="absolute -right-3 -top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {badgeCount > 99 ? "99+" : badgeCount}
          </span>
        ) : null}
      </Link>
    </Button>
  );
}
