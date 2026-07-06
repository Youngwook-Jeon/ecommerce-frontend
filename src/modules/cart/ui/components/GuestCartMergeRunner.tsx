"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { CartMergeVm } from "@/common/schemas/cart";
import { CartMergeNotifier } from "@/modules/cart/ui/components/CartMergeNotifier";
import { notifyCartBadgeUpdated } from "@/modules/cart/lib/cartBadgeSync";
import { mergeGuestCartOnLoginSafe } from "@/services/cartService";

export function GuestCartMergeRunner() {
  const router = useRouter();
  const hasStarted = useRef(false);
  const [mergeResult, setMergeResult] = useState<CartMergeVm | null>(null);

  useEffect(() => {
    if (hasStarted.current) {
      return;
    }
    hasStarted.current = true;

    void mergeGuestCartOnLoginSafe().then((result) => {
      if (!result) {
        return;
      }

      const shouldRefresh =
        result.mergedLineCount > 0 ||
        result.skippedLines.length > 0 ||
        result.syncChanges.length > 0;

      if (shouldRefresh) {
        notifyCartBadgeUpdated(result.cart);
        setMergeResult(result);
        router.refresh();
      }
    });
  }, [router]);

  if (!mergeResult) {
    return null;
  }

  return <CartMergeNotifier mergeResult={mergeResult} />;
}
