"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { OrderVm } from "@/common/schemas/order";
import { Button } from "@/components/ui/button";
import {
  loadCartBadge,
  notifyCartBadgeUpdated,
} from "@/modules/cart/lib/cartBadgeSync";
import {
  confirmationPath,
  failedPath,
} from "@/modules/checkout/lib/orderStatusRoutes";
import { OrderSummaryCard } from "@/modules/checkout/ui/components/OrderSummaryCard";
import { getOrder } from "@/services/orderService";

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 60_000;

interface OrderStatusPollerProps {
  orderId: string;
  initialOrder: OrderVm;
}

export function OrderStatusPoller({ orderId, initialOrder }: OrderStatusPollerProps) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [timedOut, setTimedOut] = useState(false);
  const [pollError, setPollError] = useState<string | null>(null);
  const [pollGeneration, setPollGeneration] = useState(0);
  const redirectedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();
    redirectedRef.current = false;

    async function redirectForStatus(next: OrderVm) {
      if (redirectedRef.current || cancelled) {
        return;
      }
      if (next.status === "CONFIRMED") {
        redirectedRef.current = true;
        try {
          const cart = await loadCartBadge();
          notifyCartBadgeUpdated(cart);
        } catch (error) {
          console.error("Failed to refresh cart badge after payment:", error);
        }
        router.replace(confirmationPath(orderId));
        return;
      }
      if (next.status === "CANCELLED" || next.status === "EXPIRED") {
        redirectedRef.current = true;
        router.replace(failedPath(orderId));
      }
    }

    async function tick() {
      if (cancelled || redirectedRef.current) {
        return;
      }

      if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
        setTimedOut(true);
        return;
      }

      try {
        const next = await getOrder(orderId);
        if (cancelled) {
          return;
        }
        setOrder(next);
        setPollError(null);
        await redirectForStatus(next);
        if (!redirectedRef.current && !cancelled) {
          timeoutId = setTimeout(() => {
            void tick();
          }, POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        setPollError(
          error instanceof Error ? error.message : "Unable to check payment status."
        );
        timeoutId = setTimeout(() => {
          void tick();
        }, POLL_INTERVAL_MS);
      }
    }

    if (pollGeneration === 0) {
      void redirectForStatus(initialOrder);
      timeoutId = setTimeout(() => {
        void tick();
      }, POLL_INTERVAL_MS);
    } else {
      void tick();
    }

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // initialOrder is only used for the first generation; retries fetch fresh status.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- restart only on orderId / pollGeneration
  }, [orderId, router, pollGeneration]);

  function handleCheckAgain() {
    setTimedOut(false);
    setPollError(null);
    setPollGeneration((current) => current + 1);
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Processing payment</h1>
        <p className="text-muted-foreground">
          Order <span className="font-medium text-foreground">#{orderId}</span> is waiting for
          payment confirmation. This usually takes a few seconds.
        </p>
      </div>

      <div
        className="rounded-xl border border-dashed p-6 text-center"
        aria-live="polite"
        aria-busy={!timedOut}
      >
        {timedOut ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Payment is taking longer than expected. Your order is still saved — you can check
              again or return to your cart.
            </p>
            <div className="flex justify-center gap-3">
              <Button type="button" onClick={handleCheckAgain}>
                Check again
              </Button>
              <Button asChild variant="outline">
                <Link href="/cart">Back to cart</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground"
              aria-hidden
            />
            <p className="text-sm font-medium">Status: {order.status.replaceAll("_", " ")}</p>
            {pollError ? <p className="text-sm text-destructive">{pollError}</p> : null}
          </div>
        )}
      </div>

      <OrderSummaryCard order={order} />
    </div>
  );
}
