"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CategoryActions } from "./CategoryActions";
import { Badge } from "@/components/ui/badge";
import {CategoryWithDepth} from "@/modules/dashboard/ui/components/admin/categories/CategoryClientPage";

export const columns: ColumnDef<CategoryWithDepth>[] = [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      // Use depth property to add indentation for hierarchy
      const depth = row.original.depth;
      const name = row.getValue("name") as string;

      return <div style={{ paddingLeft: `${depth * 1.5}rem` }}>{name}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = status === "ACTIVE" ? "default" : "destructive";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "parentId",
    header: "Parent ID",
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const category = row.original;

      return (
        <div className="text-right">
          <CategoryActions categoryId={category.id} />
        </div>
      );
    },
  },
];
