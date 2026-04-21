"use client";

import { ColumnDef } from "@tanstack/react-table";

import { OptionGroupVm } from "@/common/schemas/optionGroup";
import { Badge } from "@/components/ui/badge";
import { getOptionStatusBadgeVariant } from "@/lib/statusBadge";
import { OptionGroupActions } from "./OptionGroupActions";

type ColumnsConfig = {
  onManageValues: (optionGroup: OptionGroupVm) => void;
  onEdit: (optionGroup: OptionGroupVm) => void;
  onDelete: (optionGroup: OptionGroupVm) => void;
};

export const columns = ({
  onManageValues,
  onEdit,
  onDelete,
}: ColumnsConfig): ColumnDef<OptionGroupVm>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "displayName",
    header: "Display Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return <Badge variant={getOptionStatusBadgeVariant(status)}>{status}</Badge>;
    },
  },
  {
    id: "valueCount",
    header: "Values",
    cell: ({ row }) => row.original.optionValues.length,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => (
      <div className="text-right">
        <OptionGroupActions
          optionGroup={row.original}
          onManageValues={onManageValues}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    ),
  },
];
