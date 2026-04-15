"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import {
  OptionGroupVm,
  OptionValueVm,
  UpdateOptionValueForm as UpdateOptionValueFormValues,
  UpdateOptionValueSchema,
} from "@/common/schemas/optionGroup";
import { updateOptionValue } from "@/services/optionGroupService";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UpdateOptionValueFormProps {
  optionGroup: OptionGroupVm | null;
  optionValue: OptionValueVm | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateOptionValueForm({
  optionGroup,
  optionValue,
  isOpen,
  onClose,
}: UpdateOptionValueFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<UpdateOptionValueFormValues>({
    resolver: zodResolver(UpdateOptionValueSchema),
    defaultValues: {
      value: "",
      displayName: "",
      sortOrder: 0,
      status: "ACTIVE",
    },
  });

  useEffect(() => {
    if (optionValue) {
      form.reset({
        value: optionValue.value,
        displayName: optionValue.displayName,
        sortOrder: optionValue.sortOrder,
        status: optionValue.status,
      });
    }
  }, [optionValue, form]);

  async function onSubmit(values: UpdateOptionValueFormValues) {
    if (!optionGroup || !optionValue) return;
    setIsSubmitting(true);

    const result = await updateOptionValue(optionGroup.id, optionValue.id, values);
    if (result.success) {
      toast({
        title: "Success!",
        description: `Option value "${values.displayName}" has been updated.`,
      });
      onClose();
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
          <DialogTitle>Edit Option Value</DialogTitle>
          <DialogDescription>
            Update value details for{" "}
            <span className="font-medium">{optionGroup?.displayName ?? "-"}</span>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., RED" {...field} />
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
                    <Input placeholder="e.g., Red" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sortOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                      <SelectItem value="DELETED">DELETED</SelectItem>
                    </SelectContent>
                  </Select>
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
