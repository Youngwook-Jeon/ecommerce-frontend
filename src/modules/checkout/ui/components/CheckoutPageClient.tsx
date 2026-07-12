"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { CartVm } from "@/common/schemas/cart";
import { EMPTY_CART } from "@/common/schemas/cart";
import type { PlaceOrderInput } from "@/common/schemas/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCartPrice } from "@/modules/cart/lib/formatCartPrice";
import { notifyCartBadgeUpdated } from "@/modules/cart/lib/cartBadgeSync";
import { placeOrder } from "@/services/orderService";

interface CheckoutPageClientProps {
  initialCart: CartVm;
}

const initialForm: PlaceOrderInput = {
  recipientName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  countryCode: "KR",
};

export function CheckoutPageClient({ initialCart }: CheckoutPageClientProps) {
  const router = useRouter();
  const [form, setForm] = useState<PlaceOrderInput>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function updateField<K extends keyof PlaceOrderInput>(key: K, value: PlaceOrderInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const order = await placeOrder(form);
        notifyCartBadgeUpdated(EMPTY_CART);
        router.push(`/checkout/confirmation/${order.orderId}`);
      } catch (submitError) {
        const message =
          submitError instanceof Error ? submitError.message : "Failed to place order.";
        setError(message);
      }
    });
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
        <p className="text-muted-foreground">
          Review your items and enter a shipping address to place your order.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <form className="space-y-6 rounded-xl border p-6" onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold">Shipping address</h2>
          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="recipientName">Recipient name</Label>
              <Input
                id="recipientName"
                value={form.recipientName}
                onChange={(event) => updateField("recipientName", event.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="addressLine1">Address line 1</Label>
              <Input
                id="addressLine1"
                value={form.addressLine1}
                onChange={(event) => updateField("addressLine1", event.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="addressLine2">Address line 2 (optional)</Label>
              <Input
                id="addressLine2"
                value={form.addressLine2 ?? ""}
                onChange={(event) => updateField("addressLine2", event.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal code</Label>
              <Input
                id="postalCode"
                value={form.postalCode}
                onChange={(event) => updateField("postalCode", event.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="countryCode">Country code</Label>
              <Input
                id="countryCode"
                value={form.countryCode}
                onChange={(event) => updateField("countryCode", event.target.value.toUpperCase())}
                maxLength={2}
                required
                disabled={isPending}
              />
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Placing order..." : "Place order"}
          </Button>
        </form>

        <aside className="h-fit rounded-xl border p-6">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <Separator className="my-4" />
          <div className="space-y-4">
            {initialCart.items.map((item) => (
              <div key={item.itemId} className="flex items-start justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-muted-foreground">Qty {item.quantity}</p>
                </div>
                <span>{formatCartPrice(item.lineAmount)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCartPrice(initialCart.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">Free</span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCartPrice(initialCart.subtotal)}</span>
          </div>
          <Button asChild variant="outline" className="mt-6 w-full">
            <Link href="/cart">Back to cart</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
