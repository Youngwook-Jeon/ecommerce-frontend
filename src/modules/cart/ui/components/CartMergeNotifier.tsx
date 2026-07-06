"use client";

import { useEffect, useRef } from "react";

import type {
  CartMergeSkipReasonVm,
  CartMergeVm,
} from "@/common/schemas/cart";
import { useToast } from "@/hooks/use-toast";

interface CartMergeNotifierProps {
  mergeResult: CartMergeVm;
}

function describeSkipReason(reason: CartMergeSkipReasonVm): string {
  switch (reason) {
    case "MAX_LINE_ITEMS_EXCEEDED":
      return "your cart line limit was reached";
    case "PRODUCT_NOT_FOUND":
      return "the product is no longer available";
    case "VARIANT_NOT_FOUND":
      return "the selected variant is no longer available";
    default:
      return "it could not be added";
  }
}

export function CartMergeNotifier({ mergeResult }: CartMergeNotifierProps) {
  const { toast } = useToast();
  const notified = useRef(false);

  useEffect(() => {
    if (notified.current) {
      return;
    }
    notified.current = true;

    const { mergedLineCount, skippedLines, syncChanges } = mergeResult;

    if (mergedLineCount > 0) {
      toast({
        title: "Cart merged",
        description: `${mergedLineCount} item${
          mergedLineCount === 1 ? "" : "s"
        } from your guest cart were added to your account.`,
      });
    }

    if (skippedLines.length > 0) {
      const description = skippedLines
        .map(
          (line) =>
            `${line.productName} (${describeSkipReason(line.reason)})`
        )
        .join("; ");

      toast({
        variant: "destructive",
        title: "Some items could not be merged",
        description,
      });
    }

    if (syncChanges.length > 0) {
      toast({
        title: "Cart updated",
        description:
          "Some merged items were adjusted to match the latest catalog prices or stock.",
      });
    }
  }, [mergeResult, toast]);

  return null;
}
