import { CartPageClient } from "@/modules/cart/ui/components/CartPageClient";
import { getCurrentCart, syncCurrentCart } from "@/services/cartService";

export default async function CartPage() {
  const initialCart = await getCurrentCart();

  if (initialCart.itemCount === 0) {
    return <CartPageClient initialCart={initialCart} syncChanges={[]} />;
  }

  let cart = initialCart;
  let syncChanges: Awaited<ReturnType<typeof syncCurrentCart>>["changes"] = [];

  try {
    const syncResult = await syncCurrentCart();
    cart = syncResult.cart;
    syncChanges = syncResult.changes;
  } catch (error) {
    console.error("Failed to sync cart with catalog:", error);
  }

  return <CartPageClient initialCart={cart} syncChanges={syncChanges} />;
}
