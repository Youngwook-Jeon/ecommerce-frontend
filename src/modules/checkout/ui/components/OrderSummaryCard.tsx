import { Separator } from "@/components/ui/separator";
import type { OrderVm } from "@/common/schemas/order";
import { formatCartPrice } from "@/modules/cart/lib/formatCartPrice";

interface OrderSummaryCardProps {
  order: OrderVm;
}

export function OrderSummaryCard({ order }: OrderSummaryCardProps) {
  return (
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
  );
}

export function ShippingAddressCard({ order }: OrderSummaryCardProps) {
  const address = order.shippingAddress;
  return (
    <div className="rounded-xl border p-6">
      <h2 className="text-lg font-semibold">Shipping to</h2>
      <Separator className="my-4" />
      <div className="space-y-1 text-sm">
        <p className="font-medium">{address.recipientName}</p>
        <p className="text-muted-foreground">{address.phone}</p>
        <p>{address.addressLine1}</p>
        {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
        <p>
          {address.city}, {address.postalCode}
        </p>
        <p>{address.countryCode}</p>
      </div>
    </div>
  );
}
