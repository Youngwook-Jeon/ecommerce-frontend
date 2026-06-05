import Link from "next/link";

import Container from "@/components/global/Container";
import { Button } from "@/components/ui/button";

export default function ProductNotFoundPage() {
  return (
    <Container className="py-16">
      <div className="mx-auto max-w-md rounded-lg border bg-card p-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This product is unavailable or the link is invalid.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </Container>
  );
}

