import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CheckoutOrderNotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Order not found</h1>
      <p className="text-muted-foreground">
        We could not find that order. It may belong to another account or the link is invalid.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/cart">Back to cart</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
