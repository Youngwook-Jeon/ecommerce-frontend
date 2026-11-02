"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  CreateOptionGroupForm as CreateOptionGroupFormValues,
  CreateOptionGroupSchema,
} from "@/common/schemas/optionGroup";
import { createOptionGroup } from "@/services/optionGroupService";
import { getAttributeDefinitions } from "@/services/attributeCatalogService";
import { AttributeDefinitionVm } from "@/common/schemas/attributeCatalog";
import { getErrorMessage } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface CreateOptionGroupFormProps {
  assignedAttributeIds: string[];
  isOpen: boolean;
  onClose: () => void;
}

export function CreateOptionGroupForm({
  assignedAttributeIds,
  isOpen,
  onClose,
}: CreateOptionGroupFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [definitions, setDefinitions] = useState<AttributeDefinitionVm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CreateOptionGroupFormValues>({
    resolver: zodResolver(CreateOptionGroupSchema),
    defaultValues: {
      attributeId: "",
      name: "",
      displayName: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    getAttributeDefinitions().then((result) => {
      if (cancelled) return;
      if (result.success) {
        setDefinitions(result.data);
      } else {
        setLoadError(result.message);
      }
      setIsLoading(false);
    }).catch((error: unknown) => {
      if (cancelled) return;
      setLoadError(getErrorMessage(error));
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [isOpen, reload]);

  const availableDefinitions = definitions.filter((definition) =>
    definition.status === "ACTIVE" && !assignedAttributeIds.includes(definition.id)
  );
  const matchingDefinitions = availableDefinitions.filter((definition) =>
    `${definition.code} ${definition.displayName}`.toLowerCase().includes(search.trim().toLowerCase())
  );
  const selectedAttributeId = form.watch("attributeId");
  const canSubmit = !isLoading && !loadError && availableDefinitions.some(
    (definition) => definition.id === selectedAttributeId
  );

  async function onSubmit(values: CreateOptionGroupFormValues) {
    if (!canSubmit || isSubmitting) return;
    setIsSubmitting(true);
    const result = await createOptionGroup(values).catch((error: unknown) => ({
      success: false as const,
      message: getErrorMessage(error),
    }));

    if (result.success) {
      toast({
        title: "Success!",
        description: `Option group "${values.name}" has been created.`,
      });
      onClose();
      form.reset();
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: result.message,
      });
    }

    setIsSubmitting(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Option Group</DialogTitle>
          <DialogDescription>
            Add a reusable global option group for product configuration.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {isLoading && <p role="status" className="text-sm">Loading attributes...</p>}
            {loadError && (
              <div role="alert" className="space-y-2 text-sm text-destructive">
                <p>{loadError}</p>
                <Button type="button" variant="outline" onClick={() => setReload((value) => value + 1)}>Retry</Button>
              </div>
            )}
            {!isLoading && !loadError && availableDefinitions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No active, unassigned attributes are available. Create an attribute definition before creating a group.
              </p>
            )}
            <FormField
              control={form.control}
              name="attributeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Attribute Definition</FormLabel>
                  <Input
                    aria-label="Search attribute definitions"
                    placeholder="Search by name or code"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    disabled={isLoading || !!loadError || isSubmitting}
                  />
                  <Select value={field.value} onValueChange={field.onChange} disabled={isLoading || !!loadError || isSubmitting}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select an attribute" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableDefinitions.filter((definition) =>
                        definition.id === field.value || matchingDefinitions.includes(definition)
                      ).map((definition) => (
                        <SelectItem key={definition.id} value={definition.id}>
                          {definition.displayName} ({definition.code})
                        </SelectItem>
                      ))}
                      {matchingDefinitions.length === 0 && <p className="p-2 text-sm text-muted-foreground">No matching attributes.</p>}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., COLOR" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Color" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || !canSubmit}>
                {isSubmitting ? "Creating..." : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
