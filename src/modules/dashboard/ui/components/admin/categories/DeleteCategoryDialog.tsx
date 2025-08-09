"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/hooks/use-toast";
import { CategoryDtoVm } from "@/common/schemas/category";
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
import {deleteCategory} from "@/services/categoryService";

interface DeleteCategoryDialogProps {
    category: CategoryDtoVm | null;
    isOpen: boolean;
    onClose: () => void;
}

export function DeleteCategoryDialog({ category, isOpen, onClose }: DeleteCategoryDialogProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleDelete = async () => {
        if (!category) return;

        setIsDeleting(true);
        const result = await deleteCategory(category.id);

        if (result.success) {
            toast({
                title: "Success!",
                description: `Category "${category.name}" has been deleted.`,
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
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will mark the category <span className="font-semibold">&quot;{category?.name}&quot;</span> as deleted. This may also affect its sub-categories.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button onClick={handleDelete} disabled={isDeleting} variant="destructive">
                            {isDeleting ? "Deleting..." : "Continue"}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}