import Link from "next/link";

import Container from "@/components/global/Container";
import { Button } from "@/components/ui/button";

export default function CategoryProductsNotFound() {
  return (
    <Container className="py-16 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Category not found</h1>
      <p className="mt-2 text-muted-foreground">
        This category does not exist or is not available in the store.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Back to home</Link>
      </Button>
    </Container>
  );
}
