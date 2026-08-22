"use client";

import {
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useState } from "react";

import { Button } from "@/components/ui/button";

interface StripePaymentFormProps {
  orderId: string;
  onPaid: () => void;
}

export function StripePaymentForm({ orderId, onPaid }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripe || !elements || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const returnUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/checkout/processing/${orderId}`
        : undefined;

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl ?? `/checkout/processing/${orderId}`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setErrorMessage(result.error.message ?? "Payment failed. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // PaymentIntent succeeded or processing — wait for webhook → order CONFIRMED.
    onPaid();
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {errorMessage ? (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={!stripe || !elements || isSubmitting}>
        {isSubmitting ? "Confirming…" : "Pay now"}
      </Button>
    </form>
  );
}
