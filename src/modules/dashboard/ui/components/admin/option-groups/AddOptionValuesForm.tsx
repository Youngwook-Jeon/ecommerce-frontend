"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import {
  AddOptionValuesForm as AddOptionValuesFormValues,
  AddOptionValuesSchema,
  OptionGroupVm,
} from "@/common/schemas/optionGroup";
import { addOptionValues } from "@/services/optionGroupService";
import { getAttributeValueChoices } from "@/services/attributeCatalogService";
import { AttributeDefinitionVm, AttributeValueVm } from "@/common/schemas/attributeCatalog";
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
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddOptionValuesFormProps {
  optionGroup: OptionGroupVm | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AddOptionValuesForm({
  optionGroup,
  isOpen,
  onClose,
}: AddOptionValuesFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [definition, setDefinition] = useState<AttributeDefinitionVm | null>(null);
  const [attributeValues, setAttributeValues] = useState<AttributeValueVm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AddOptionValuesFormValues>({
    resolver: zodResolver(AddOptionValuesSchema),
    defaultValues: {
      optionValues: [{ attributeValueId: "", value: "", displayName: "", sortOrder: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "optionValues",
  });

  const attributeId = optionGroup?.attributeId;
  useEffect(() => {
    if (!isOpen || !attributeId) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    getAttributeValueChoices(attributeId).then((result) => {
      if (cancelled) return;
      if (result.success) {
        setDefinition(result.data.definition);
        setAttributeValues(result.data.values);
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
  }, [isOpen, attributeId, reload]);

  const usedValueIds = new Set(optionGroup?.optionValues.map((value) => value.attributeValueId));
  const availableValues = attributeValues.filter((value) => !usedValueIds.has(value.id));
  const selectedValues = form.watch("optionValues");
  const canAdd = !!attributeId && optionGroup?.status !== "DELETED" &&
    !isLoading && !loadError && definition?.status === "ACTIVE" && availableValues.length > 0;

  async function onSubmit(values: AddOptionValuesFormValues) {
    if (!optionGroup || !canAdd || isSubmitting) return;

    setIsSubmitting(true);
    const result = await addOptionValues(optionGroup.id, values).catch((error: unknown) => ({
      success: false as const,
      message: getErrorMessage(error),
    }));

    if (result.success) {
      toast({
        title: "Success!",
        description: `${values.optionValues.length} option value(s) added to "${optionGroup.name}".`,
      });
      onClose();
      form.reset({
        optionValues: [{ attributeValueId: "", value: "", displayName: "", sortOrder: 0 }],
      });
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Option Values</DialogTitle>
          <DialogDescription>
            Bulk add values into{" "}
            <span className="font-medium">{optionGroup?.displayName ?? "-"}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {!attributeId ? (
              <p role="alert" className="text-sm text-destructive">This group is not linked to an attribute. Link it before adding values.</p>
            ) : isLoading ? (
              <p role="status" className="text-sm">Loading attribute values...</p>
            ) : loadError ? (
              <div role="alert" className="space-y-2 text-sm text-destructive">
                <p>{loadError}</p>
                <Button type="button" variant="outline" onClick={() => setReload((value) => value + 1)}>Retry</Button>
              </div>
            ) : definition?.status !== "ACTIVE" ? (
              <p role="alert" className="text-sm text-destructive">The linked attribute is inactive. New option values cannot be added.</p>
            ) : availableValues.length === 0 ? (
              <p className="text-sm text-muted-foreground">No unused attribute values are available. Create values for the linked attribute before adding options.</p>
            ) : (
              <p className="text-sm text-muted-foreground">Attribute: {definition.displayName} ({definition.code})</p>
            )}
            <fieldset disabled={!canAdd || isSubmitting} className="space-y-4">
              <ScrollArea className="h-[360px] pr-4">
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="rounded-md border p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-medium">Value #{index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={isSubmitting || fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormField
                        control={form.control}
                        name={`optionValues.${index}.attributeValueId`}
                        render={({ field: attributeField }) => (
                          <FormItem className="mb-3">
                            <FormLabel>Attribute Value</FormLabel>
                            <Select
                              value={attributeField.value}
                              disabled={!canAdd || isSubmitting}
                              onValueChange={(id) => {
                                attributeField.onChange(id);
                                const selected = availableValues.find((value) => value.id === id);
                                if (selected && !form.getValues(`optionValues.${index}.displayName`)) {
                                  form.setValue(`optionValues.${index}.displayName`, selected.displayName, { shouldDirty: true });
                                }
                              }}
                            >
                              <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select an attribute value" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableValues.map((value) => (
                                  <SelectItem
                                    key={value.id}
                                    value={value.id}
                                    disabled={selectedValues.some((selected, selectedIndex) => selectedIndex !== index && selected.attributeValueId === value.id)}
                                  >
                                    {value.displayName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid gap-3 md:grid-cols-3">
                        <FormField
                          control={form.control}
                          name={`optionValues.${index}.value`}
                          render={({ field: valueField }) => (
                            <FormItem>
                              <FormLabel>Value</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., RED" {...valueField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`optionValues.${index}.displayName`}
                          render={({ field: displayField }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Red" {...displayField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`optionValues.${index}.sortOrder`}
                          render={({ field: sortField }) => (
                            <FormItem>
                              <FormLabel>Sort Order</FormLabel>
                              <FormControl>
                                <Input type="number" min={0} step={1} {...sortField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting || !canAdd || fields.length >= availableValues.length}
                onClick={() => append({ attributeValueId: "", value: "", displayName: "", sortOrder: fields.length })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Row
              </Button>
            </fieldset>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting || !canAdd}>
                {isSubmitting ? "Saving..." : "Add Values"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
