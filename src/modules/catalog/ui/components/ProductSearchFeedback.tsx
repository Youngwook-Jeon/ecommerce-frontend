"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface ProductSearchFeedbackProps {
  status: number;
  code?: string;
}
export function ProductSearchFeedback({ status, code }: ProductSearchFeedbackProps) {
  const router = useRouter();
  const invalid = status === 400;
  const missing = status === 404;
  return (
    <section role="alert" className="rounded-lg border p-8 text-center">
      <h1 className="text-xl font-semibold">
        {invalid ? "Invalid search" : missing ? "Category unavailable" : "Search temporarily unavailable"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {code === "SEARCH_PAGE_LIMIT_EXCEEDED"
          ? "This page exceeds the search limit. Narrow your search or return to the first page."
          : invalid ? "Check your search, filters and page number, then try again."
          : missing ? "This category could not be found or is no longer available."
          : "We could not load the search results. Please try again."}
      </p>
      <div className="mt-4 flex justify-center gap-3">
        {!invalid && !missing ? <Button onClick={() => router.refresh()}>Try again</Button> : null}
        <Button asChild variant="outline"><Link href="/search">Browse all products</Link></Button>
      </div>
    </section>
  );
}
