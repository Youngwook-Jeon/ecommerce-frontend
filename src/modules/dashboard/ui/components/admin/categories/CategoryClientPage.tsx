"use client"

import { PlusCircle } from "lucide-react";
import {useCallback, useMemo, useState} from "react";

import { CategoryDtoVm } from "@/common/schemas/category";
import { columns } from "./columns";
import { CategoryDataTable } from "./CategoryDataTable";
import { Button } from "@/components/ui/button";
import {CreateCategoryForm} from "@/modules/dashboard/ui/components/admin/categories/CreateCategoryForm";
import {UpdateCategoryForm} from "@/modules/dashboard/ui/components/admin/categories/UpdateCategoryForm";
import {DeleteCategoryDialog} from "@/modules/dashboard/ui/components/admin/categories/DeleteCategoryDialog";

interface CategoriesClientPageProps {
    initialData: CategoryDtoVm[];
}

// A helper type to add 'depth' to our DTO for rendering
export type CategoryWithDepth = CategoryDtoVm & { depth: number };

export function CategoriesClientPage({ initialData }: CategoriesClientPageProps) {
    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
    const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryDtoVm | null>(null);

    const handleEdit = useCallback((category: CategoryDtoVm) => {
        setSelectedCategory(category);
        setIsUpdateFormOpen(true);
    }, []);

    const handleDelete = useCallback((category: CategoryDtoVm) => {
        setSelectedCategory(category);
        setIsDeleteDialogOpen(true);
    }, []);

    const handleCloseForms = () => {
        setSelectedCategory(null);
        setIsUpdateFormOpen(false);
        setIsDeleteDialogOpen(false);
    }

    // A recursive function to flatten the hierarchy into a list for the table
    const flattenHierarchy = useCallback((categories: CategoryDtoVm[], depth = 0): CategoryWithDepth[] => {
        const flattenedList: CategoryWithDepth[] = [];
        for (const category of categories) {
            flattenedList.push({ ...category, depth });
            if (category.children && category.children.length > 0) {
                flattenedList.push(...flattenHierarchy(category.children, depth + 1));
            }
        }
        return flattenedList;
    }, []);

    // useMemo to prevent re-calculating the flattened list on every render
    const flattenedData = useMemo(() => flattenHierarchy(initialData), [flattenHierarchy, initialData]);

    const tableColumns = useMemo(() => columns({ onEdit: handleEdit, onDelete: handleDelete }), [handleEdit, handleDelete]);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setIsCreateFormOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Create New Category
                </Button>
            </div>
            <CategoryDataTable columns={tableColumns} data={flattenedData} />

            <CreateCategoryForm
                isOpen={isCreateFormOpen}
                onClose={() => setIsCreateFormOpen(false)}
            />

            <UpdateCategoryForm
                isOpen={isUpdateFormOpen}
                onClose={handleCloseForms}
                category={selectedCategory}
            />

            <DeleteCategoryDialog
                isOpen={isDeleteDialogOpen}
                onClose={handleCloseForms}
                category={selectedCategory}
            />
        </div>
    )
}