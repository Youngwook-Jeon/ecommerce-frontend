import { notFound, redirect } from "next/navigation";

import { pathForOrderStatus } from "@/modules/checkout/lib/orderStatusRoutes";
import { CheckoutProcessingClient } from "@/modules/checkout/ui/components/CheckoutProcessingClient";
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

  return <CheckoutProcessingClient orderId={orderId} initialOrder={order} />;
}
