import { redirect } from "next/navigation";

import { getAuthUserInfo } from "@/common/services/authService";
import { CheckoutPageClient } from "@/modules/checkout/ui/components/CheckoutPageClient";
import { getCurrentCart, syncCurrentCart } from "@/services/cartService";

export default async function CheckoutPage() {
  const auth = await getAuthUserInfo().catch(() => null);
  if (!auth?.isAuthenticated) {
    redirect("/oauth2/authorization/edge-service-keycloak");
  }

  const initialCart = await getCurrentCart();
  if (initialCart.itemCount === 0) {
    redirect("/cart");
  }

  let cart = initialCart;
  try {
    const syncResult = await syncCurrentCart();
    cart = syncResult.cart;
    if (cart.itemCount === 0) {
      redirect("/cart");
    }
  } catch (error) {
    console.error("Failed to sync cart before checkout:", error);
  }

  return <CheckoutPageClient initialCart={cart} />;
}
