"use client";

import { MoreHorizontal, Pencil, Settings2, Trash2 } from "lucide-react";

import { OptionGroupVm } from "@/common/schemas/optionGroup";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OptionGroupActionsProps {
  optionGroup: OptionGroupVm;
  onManageValues: (optionGroup: OptionGroupVm) => void;
  onEdit: (optionGroup: OptionGroupVm) => void;
  onDelete: (optionGroup: OptionGroupVm) => void;
}

export function OptionGroupActions({
  optionGroup,
  onManageValues,
  onEdit,
  onDelete,
}: OptionGroupActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onManageValues(optionGroup)}>
          <Settings2 className="mr-2 h-4 w-4" />
          <span>Manage Values</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(optionGroup)}>
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit Group</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(optionGroup)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Group</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
