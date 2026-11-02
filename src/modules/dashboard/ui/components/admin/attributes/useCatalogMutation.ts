"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export type CatalogActionResult = { success: boolean; message?: string };

export function useCatalogMutation() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  async function run<T extends CatalogActionResult>(action: () => Promise<T>, onSuccess?: (result: T) => void) {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      const result = await action();
      if (!result.success) throw new Error(result.message || "The change could not be saved.");
      toast({ title: "Changes saved" });
      router.refresh();
      onSuccess?.(result);
    } catch (failure: unknown) {
      setError(getErrorMessage(failure));
    } finally {
      setPending(false);
    }
  }

  return { pending, error, run };
}
