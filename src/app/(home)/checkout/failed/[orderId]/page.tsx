import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { pathForOrderStatus } from "@/modules/checkout/lib/orderStatusRoutes";
import {
  OrderSummaryCard,
  ShippingAddressCard,
} from "@/modules/checkout/ui/components/OrderSummaryCard";
import { getOrder } from "@/services/orderService";

interface CheckoutFailedPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function CheckoutFailedPage({ params }: CheckoutFailedPageProps) {
  const { orderId } = await params;

  let order;
  try {
    order = await getOrder(orderId);
  } catch {
    notFound();
  }

  if (order.status !== "CANCELLED" && order.status !== "EXPIRED") {
    redirect(pathForOrderStatus(order));
  }

  const title = order.status === "EXPIRED" ? "Order expired" : "Payment failed";
  const description =
    order.status === "EXPIRED"
      ? "The payment window for this order expired. Items should still be in your cart if stock remains."
      : "We could not complete payment for this order. Items remain in your cart so you can try again.";

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">
          Order <span className="font-medium text-foreground">#{order.orderId}</span> — {description}
        </p>
      </div>

      <OrderSummaryCard order={order} />
      <ShippingAddressCard order={order} />

      <div className="flex justify-center gap-3">
        <Button asChild>
          <Link href="/cart">Back to cart</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/checkout">Try checkout again</Link>
        </Button>
      </div>
    </div>
  );
}
