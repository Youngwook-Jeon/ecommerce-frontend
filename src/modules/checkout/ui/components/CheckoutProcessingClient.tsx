"use client";

import { Elements } from "@stripe/react-stripe-js";
import { useEffect, useMemo, useState } from "react";

import type { OrderVm } from "@/common/schemas/order";
import type { ClientSecretVm } from "@/common/schemas/payment";
import { getStripe, getStripePublishableKey } from "@/modules/checkout/lib/stripeClient";
import { OrderStatusPoller } from "@/modules/checkout/ui/components/OrderStatusPoller";
import { OrderSummaryCard } from "@/modules/checkout/ui/components/OrderSummaryCard";
import { StripePaymentForm } from "@/modules/checkout/ui/components/StripePaymentForm";
import { getClientSecretByOrderId } from "@/services/paymentService";

const SECRET_RETRY_INTERVAL_MS = 1000;
const SECRET_RETRY_TIMEOUT_MS = 30_000;

type Phase = "loading_secret" | "pay" | "confirming" | "error";

interface CheckoutProcessingClientProps {
  orderId: string;
  initialOrder: OrderVm;
}

function hasStripeRedirectResult(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  const params = new URLSearchParams(window.location.search);
  const redirectStatus = params.get("redirect_status");
  return redirectStatus === "succeeded" || redirectStatus === "processing";
}

export function CheckoutProcessingClient({
  orderId,
  initialOrder,
}: CheckoutProcessingClientProps) {
  const [phase, setPhase] = useState<Phase>(() =>
    hasStripeRedirectResult() ? "confirming" : "loading_secret"
  );
  const [clientSecretView, setClientSecretView] = useState<ClientSecretVm | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const stripePromise = useMemo(() => getStripe(), []);

  useEffect(() => {
    if (phase !== "loading_secret") {
      return;
    }

    let cancelled = false;
    const startedAt = Date.now();

    async function loadSecret() {
      while (!cancelled) {
        try {
          const view = await getClientSecretByOrderId(orderId);
          if (cancelled) {
            return;
          }
          setClientSecretView(view);

          if (view.provider === "STUB") {
            setPhase("confirming");
            return;
          }

          if (!getStripePublishableKey()) {
            setLoadError(
              "Stripe publishable key is missing. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in the frontend env."
            );
            setPhase("error");
            return;
          }

          setPhase("pay");
          return;
        } catch (error) {
          if (cancelled) {
            return;
          }
          if (Date.now() - startedAt >= SECRET_RETRY_TIMEOUT_MS) {
            setLoadError(
              error instanceof Error
                ? error.message
                : "Payment session is not ready yet. Please try again."
            );
            setPhase("error");
            return;
          }
          await sleep(SECRET_RETRY_INTERVAL_MS);
        }
      }
    }

    void loadSecret();
    return () => {
      cancelled = true;
    };
  }, [orderId, phase]);

  if (phase === "loading_secret") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
        <Header orderId={orderId} title="Preparing payment" />
        <BusyCard message="Creating a secure payment session…" />
        <OrderSummaryCard order={initialOrder} />
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6 py-8">
        <Header orderId={orderId} title="Payment unavailable" />
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          {loadError ?? "Unable to start payment."}
        </div>
        <OrderSummaryCard order={initialOrder} />
      </div>
    );
  }

  if (phase === "confirming") {
    return <OrderStatusPoller orderId={orderId} initialOrder={initialOrder} />;
  }

  if (!clientSecretView) {
    return null;
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <Header orderId={orderId} title="Complete payment" />
        <div className="rounded-xl border p-6">
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: clientSecretView.clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#18181b",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <StripePaymentForm orderId={orderId} onPaid={() => setPhase("confirming")} />
          </Elements>
        </div>
      </div>
      <OrderSummaryCard order={initialOrder} />
    </div>
  );
}

function Header({ orderId, title }: { orderId: string; title: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">
        Order <span className="font-medium text-foreground">#{orderId}</span>
      </p>
    </div>
  );
}

function BusyCard({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed p-6 text-center" aria-busy aria-live="polite">
      <div
        className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground"
        aria-hidden
      />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
