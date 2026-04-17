"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminProductDtoVm } from "@/services/productService";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ColumnsConfig = {
  onEdit: (product: AdminProductDtoVm) => void;
  onUpdateStatus: (product: AdminProductDtoVm) => void;
  onDelete: (product: AdminProductDtoVm) => void;
};

export const columns = ({
  onEdit,
  onUpdateStatus,
  onDelete,
}: ColumnsConfig): ColumnDef<AdminProductDtoVm>[] => [
  {
    accessorKey: "id",
    header: "Id",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "brand",
    header: "Brand",
  },
  {
    accessorKey: "categoryId",
    header: "Category Id",
  },
  {
    accessorKey: "basePrice",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("basePrice") as number;
      return <span>{price.toFixed(2)} $</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant =
        status === "ACTIVE"
          ? "default"
          : status === "INACTIVE"
          ? "outline"
          : "destructive";
      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    accessorKey: "conditionType",
    header: "Condition",
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const product = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onEdit(product)}>
              Edit Product
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUpdateStatus(product)}>
              Update Status
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600 focus:text-red-700"
              onClick={() => onDelete(product)}
            >
              Delete Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

