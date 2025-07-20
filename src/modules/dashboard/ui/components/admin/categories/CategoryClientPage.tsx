"use client"

import { PlusCircle } from "lucide-react";
import {useMemo, useState} from "react";

import { CategoryDtoVm } from "@/common/schemas/category";
import { columns } from "./columns";
import { CategoryDataTable } from "./CategoryDataTable";
import { Button } from "@/components/ui/button";
import {CreateCategoryForm} from "@/modules/dashboard/ui/components/admin/categories/CreateCategoryForm";

interface CategoriesClientPageProps {
    initialData: CategoryDtoVm[];
}

// A helper type to add 'depth' to our DTO for rendering
export type CategoryWithDepth = CategoryDtoVm & { depth: number };

export function CategoriesClientPage({ initialData }: CategoriesClientPageProps) {
    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);

    // A recursive function to flatten the hierarchy into a list for the table
    const flattenHierarchy = (categories: CategoryDtoVm[], depth = 0): CategoryWithDepth[] => {
        let flattenedList: CategoryWithDepth[] = [];
        for (const category of categories) {
            flattenedList.push({ ...category, depth });
            if (category.children && category.children.length > 0) {
                flattenedList = [...flattenedList, ...flattenHierarchy(category.children, depth + 1)];
            }
        }
        return flattenedList;
    };

    // useMemo to prevent re-calculating the flattened list on every render
    const flattenedData = useMemo(() => flattenHierarchy(initialData), [initialData]);

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => setIsCreateFormOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Create New Category
                </Button>
            </div>
            <CategoryDataTable columns={columns} data={flattenedData} />

            <CreateCategoryForm
                isOpen={isCreateFormOpen}
                onClose={() => setIsCreateFormOpen(false)}
            />
        </div>
    )
}