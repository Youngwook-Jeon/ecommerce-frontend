"use client";

import { useMemo, useState } from "react";
import { PlusCircle, PlusSquare, Pencil, Trash2 } from "lucide-react";

import { OptionGroupVm, OptionValueVm } from "@/common/schemas/optionGroup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getOptionStatusBadgeVariant } from "@/lib/statusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OptionGroupDataTable } from "./OptionGroupDataTable";
import { columns } from "./columns";
import { CreateOptionGroupForm } from "./CreateOptionGroupForm";
import { UpdateOptionGroupForm } from "./UpdateOptionGroupForm";
import { DeleteOptionGroupDialog } from "./DeleteOptionGroupDialog";
import { AddOptionValuesForm } from "./AddOptionValuesForm";
import { UpdateOptionValueForm } from "./UpdateOptionValueForm";
import { DeleteOptionValueDialog } from "./DeleteOptionValueDialog";

interface OptionGroupsClientPageProps {
  initialData: OptionGroupVm[];
}

export function OptionGroupsClientPage({ initialData }: OptionGroupsClientPageProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    initialData[0]?.id ?? null
  );
  const [selectedGroup, setSelectedGroup] = useState<OptionGroupVm | null>(null);
  const [selectedValue, setSelectedValue] = useState<OptionValueVm | null>(null);

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isUpdateGroupOpen, setIsUpdateGroupOpen] = useState(false);
  const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);
  const [isAddValuesOpen, setIsAddValuesOpen] = useState(false);
  const [isUpdateValueOpen, setIsUpdateValueOpen] = useState(false);
  const [isDeleteValueOpen, setIsDeleteValueOpen] = useState(false);

  const activeGroup =
    initialData.find((group) => group.id === selectedGroupId) ?? initialData[0] ?? null;

  const tableColumns = useMemo(
    () =>
      columns({
        onManageValues: (group) => {
          setSelectedGroupId(group.id);
          setSelectedGroup(group);
        },
        onEdit: (group) => {
          setSelectedGroup(group);
          setIsUpdateGroupOpen(true);
        },
        onDelete: (group) => {
          setSelectedGroup(group);
          setIsDeleteGroupOpen(true);
        },
      }),
    []
  );

  const sortedOptionValues = useMemo(() => {
    if (!activeGroup) return [];
    return [...activeGroup.optionValues].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [activeGroup]);

  const closeDialogs = () => {
    setSelectedGroup(null);
    setSelectedValue(null);
    setIsUpdateGroupOpen(false);
    setIsDeleteGroupOpen(false);
    setIsAddValuesOpen(false);
    setIsUpdateValueOpen(false);
    setIsDeleteValueOpen(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Global Option Groups</CardTitle>
            <CardDescription>
              Manage reusable option groups used by product compositions.
            </CardDescription>
          </div>
          <Button onClick={() => setIsCreateGroupOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </CardHeader>
        <CardContent>
          <OptionGroupDataTable
            columns={tableColumns}
            data={initialData}
            selectedGroupId={selectedGroupId}
            onRowClick={(group) => {
              setSelectedGroupId(group.id);
              setSelectedGroup(group);
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Option Values</CardTitle>
            <CardDescription>
              {activeGroup
                ? `Group: ${activeGroup.displayName} (${activeGroup.name})`
                : "Select an option group to manage its values."}
            </CardDescription>
          </div>
          <Button onClick={() => setIsAddValuesOpen(true)} disabled={!activeGroup}>
            <PlusSquare className="mr-2 h-4 w-4" />
            Add Values
          </Button>
        </CardHeader>
        <CardContent>
          {activeGroup ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Value</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Sort Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOptionValues.length > 0 ? (
                    sortedOptionValues.map((value) => (
                      <TableRow key={value.id}>
                        <TableCell>{value.value}</TableCell>
                        <TableCell>{value.displayName}</TableCell>
                        <TableCell>{value.sortOrder}</TableCell>
                        <TableCell>
                          <Badge variant={getOptionStatusBadgeVariant(value.status)}>
                            {value.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedValue(value);
                              setIsUpdateValueOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedValue(value);
                              setIsDeleteValueOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No option values in this group yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              There are no option groups yet. Create one first.
            </p>
          )}
        </CardContent>
      </Card>

      <CreateOptionGroupForm
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
      />
      <UpdateOptionGroupForm
        isOpen={isUpdateGroupOpen}
        onClose={closeDialogs}
        optionGroup={selectedGroup}
      />
      <DeleteOptionGroupDialog
        isOpen={isDeleteGroupOpen}
        onClose={closeDialogs}
        optionGroup={selectedGroup}
      />
      <AddOptionValuesForm
        isOpen={isAddValuesOpen}
        onClose={closeDialogs}
        optionGroup={activeGroup}
      />
      <UpdateOptionValueForm
        isOpen={isUpdateValueOpen}
        onClose={closeDialogs}
        optionGroup={activeGroup}
        optionValue={selectedValue}
      />
      <DeleteOptionValueDialog
        isOpen={isDeleteValueOpen}
        onClose={closeDialogs}
        optionGroup={activeGroup}
        optionValue={selectedValue}
      />
    </div>
  );
}
