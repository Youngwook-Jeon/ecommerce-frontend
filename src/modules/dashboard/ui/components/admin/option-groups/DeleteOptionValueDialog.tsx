"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { OptionGroupVm, OptionValueVm } from "@/common/schemas/optionGroup";
import { deleteOptionValue } from "@/services/optionGroupService";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteOptionValueDialogProps {
  optionGroup: OptionGroupVm | null;
  optionValue: OptionValueVm | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteOptionValueDialog({
  optionGroup,
  optionValue,
  isOpen,
  onClose,
}: DeleteOptionValueDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    if (!optionGroup || !optionValue) return;

    setIsDeleting(true);
    const result = await deleteOptionValue(optionGroup.id, optionValue.id);

    if (result.success) {
      toast({
        title: "Success!",
        description: `Option value "${optionValue.displayName}" has been deleted.`,
      });
      onClose();
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: result.message,
      });
    }

    setIsDeleting(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete option value?</AlertDialogTitle>
          <AlertDialogDescription>
            This will soft-delete{" "}
            <span className="font-semibold">&quot;{optionValue?.displayName}&quot;</span>{" "}
            from <span className="font-semibold">{optionGroup?.displayName}</span>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleDelete} disabled={isDeleting} variant="destructive">
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
