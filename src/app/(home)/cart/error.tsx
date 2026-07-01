"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

interface CartErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CartError({ error, reset }: CartErrorProps) {
  useEffect(() => {
    console.error("Cart page error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Unable to load your cart</h1>
      <p className="text-muted-foreground">
        The cart service may be unavailable. Please try again in a moment.
      </p>
      <div className="flex gap-3">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Go home</Link>
        </Button>
      </div>
    </div>
  );
}
