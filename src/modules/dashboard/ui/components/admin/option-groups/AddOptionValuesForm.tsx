"use client";

import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<AddOptionValuesFormValues>({
    resolver: zodResolver(AddOptionValuesSchema),
    defaultValues: {
      optionValues: [{ value: "", displayName: "", sortOrder: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "optionValues",
  });

  async function onSubmit(values: AddOptionValuesFormValues) {
    if (!optionGroup) return;

    setIsSubmitting(true);
    const result = await addOptionValues(optionGroup.id, values);

    if (result.success) {
      toast({
        title: "Success!",
        description: `${values.optionValues.length} option value(s) added to "${optionGroup.name}".`,
      });
      onClose();
      form.reset({
        optionValues: [{ value: "", displayName: "", sortOrder: 0 }],
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
            <ScrollArea className="max-h-[420px] pr-4">
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
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
              onClick={() => append({ value: "", displayName: "", sortOrder: 0 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Row
            </Button>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Add Values"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
