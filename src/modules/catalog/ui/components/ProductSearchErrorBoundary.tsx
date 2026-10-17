"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ProductSearchErrorBoundary({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <section role="alert" className="mx-auto max-w-xl p-10 text-center">
      <h2 className="text-xl font-semibold">Unable to load products</h2>
      <p className="my-4 text-muted-foreground">Please try again.</p>
      <Button onClick={() => { router.refresh(); reset(); }}>Try again</Button>
    </section>
  );
}
