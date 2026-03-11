"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { AdminProductDtoVm } from "@/services/productService";
import { Button } from "@/components/ui/button";

type ColumnsConfig = {
  onEdit: (product: AdminProductDtoVm) => void;
  onDelete: (product: AdminProductDtoVm) => void;
};

export const columns = ({
  onEdit,
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
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(product)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(product)}
          >
            Delete
          </Button>
        </div>
      );
    },
  },
];

