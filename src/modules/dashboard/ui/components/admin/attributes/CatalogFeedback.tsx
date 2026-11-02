"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CatalogError({ message }: { message: string }) {
  const router = useRouter();
  return (
    <div role="alert" className="space-y-3 rounded-md border p-4">
      <p className="text-sm text-destructive">{message}</p>
      <Button variant="outline" onClick={() => router.refresh()}>Retry</Button>
    </div>
  );
}

export function MutationError({ message }: { message: string | null }) {
  return message ? <p role="alert" className="text-sm text-destructive">{message}</p> : null;
}
