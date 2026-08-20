import type { OrderVm } from "@/common/schemas/order";

export function processingPath(orderId: string): string {
  return `/checkout/processing/${orderId}`;
}

export function confirmationPath(orderId: string): string {
  return `/checkout/confirmation/${orderId}`;
}

export function failedPath(orderId: string): string {
  return `/checkout/failed/${orderId}`;
}

/** Destination that matches the order's terminal (or pending) status. */
export function pathForOrderStatus(order: Pick<OrderVm, "orderId" | "status">): string {
  switch (order.status) {
    case "CONFIRMED":
      return confirmationPath(order.orderId);
    case "CANCELLED":
    case "EXPIRED":
      return failedPath(order.orderId);
    case "PENDING_PAYMENT":
    default:
      return processingPath(order.orderId);
  }
}
