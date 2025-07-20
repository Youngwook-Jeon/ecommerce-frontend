"use client"

import { PlusCircle } from "lucide-react";
import { useMemo } from "react";

import { CategoryDtoVm } from "@/common/schemas/category";
import { columns } from "./columns";
import { CategoryDataTable } from "./CategoryDataTable";
import { Button } from "@/components/ui/button";

interface CategoriesClientPageProps {
    initialData: CategoryDtoVm[];
}

// A helper type to add 'depth' to our DTO for rendering
export type CategoryWithDepth = CategoryDtoVm & { depth: number };

export function CategoriesClientPage({ initialData }: CategoriesClientPageProps) {

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

    const handleCreate = () => {
        console.log("Open create category dialog");
        // TODO: Open create dialog/modal
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={handleCreate}>
                    <PlusCircle className="mr-2 h-4 w-4"/>
                    Create New Category
                </Button>
            </div>
            <CategoryDataTable columns={columns} data={flattenedData} />
        </div>
    )
}