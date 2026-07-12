import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCartPrice } from "@/modules/cart/lib/formatCartPrice";
import { getOrder } from "@/services/orderService";

interface CheckoutConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function CheckoutConfirmationPage({
  params,
}: CheckoutConfirmationPageProps) {
  const { orderId } = await params;

  let order;
  try {
    order = await getOrder(orderId);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Order confirmed</h1>
        <p className="text-muted-foreground">
          Thank you. Your order <span className="font-medium text-foreground">#{order.orderId}</span>{" "}
          has been placed.
        </p>
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <Separator className="my-4" />
        <div className="space-y-3 text-sm">
          {order.lines.map((line) => (
            <div key={line.lineId} className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{line.productName}</p>
                <p className="text-muted-foreground">Qty {line.quantity}</p>
              </div>
              <span>{formatCartPrice(line.lineAmount)}</span>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCartPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatCartPrice(order.shippingAmount)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCartPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Shipping to</h2>
        <Separator className="my-4" />
        <div className="space-y-1 text-sm">
          <p className="font-medium">{order.shippingAddress.recipientName}</p>
          <p className="text-muted-foreground">{order.shippingAddress.phone}</p>
          <p>{order.shippingAddress.addressLine1}</p>
          {order.shippingAddress.addressLine2 ? <p>{order.shippingAddress.addressLine2}</p> : null}
          <p>
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}
          </p>
          <p>{order.shippingAddress.countryCode}</p>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button asChild>
          <Link href="/">Continue shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/cart">View cart</Link>
        </Button>
      </div>
    </div>
  );
}
