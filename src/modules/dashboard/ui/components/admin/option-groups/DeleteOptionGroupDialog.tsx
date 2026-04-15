"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { OptionGroupVm } from "@/common/schemas/optionGroup";
import { deleteOptionGroup } from "@/services/optionGroupService";
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

interface DeleteOptionGroupDialogProps {
  optionGroup: OptionGroupVm | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteOptionGroupDialog({
  optionGroup,
  isOpen,
  onClose,
}: DeleteOptionGroupDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    if (!optionGroup) return;

    setIsDeleting(true);
    const result = await deleteOptionGroup(optionGroup.id);

    if (result.success) {
      toast({
        title: "Success!",
        description: `Option group "${optionGroup.name}" has been deleted.`,
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
          <AlertDialogTitle>Delete option group?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will mark{" "}
            <span className="font-semibold">&quot;{optionGroup?.name}&quot;</span>{" "}
            as deleted. Existing products using this group can be affected.
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
