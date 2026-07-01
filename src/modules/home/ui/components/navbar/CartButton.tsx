import Link from "next/link";
import { LuShoppingCart } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import { getCurrentCartSafe } from "@/services/cartService";

export default async function CartButton() {
  const cart = await getCurrentCartSafe();
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
