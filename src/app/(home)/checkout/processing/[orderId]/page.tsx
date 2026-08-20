import { notFound, redirect } from "next/navigation";

import { pathForOrderStatus } from "@/modules/checkout/lib/orderStatusRoutes";
import { OrderStatusPoller } from "@/modules/checkout/ui/components/OrderStatusPoller";
import { getOrder } from "@/services/orderService";

interface CheckoutProcessingPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function CheckoutProcessingPage({
  params,
}: CheckoutProcessingPageProps) {
  const { orderId } = await params;

  let order;
  try {
    order = await getOrder(orderId);
  } catch {
    notFound();
  }

  if (order.status !== "PENDING_PAYMENT") {
    redirect(pathForOrderStatus(order));
  }

  return <OrderStatusPoller orderId={orderId} initialOrder={order} />;
}
