"use client";

import Link from "next/link";
import { useEffect } from "react";

import Container from "@/components/global/Container";
import { Button } from "@/components/ui/button";

interface ProductDetailErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductDetailError({ error, reset }: ProductDetailErrorProps) {
  useEffect(() => {
    console.error("Product detail page error:", error);
  }, [error]);

  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md rounded-lg border bg-card p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Could not load product
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong while loading this product. Please try again.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" onClick={reset}>
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
