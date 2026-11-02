"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateAttributeFormValues, CreateAttributeSchema } from "@/common/schemas/attributeCatalog";
import { createAttribute } from "@/services/attributeCatalogService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCatalogMutation } from "./useCatalogMutation";
import { MutationError } from "./CatalogFeedback";

export function CreateAttributeDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const mutation = useCatalogMutation();
  const form = useForm<CreateAttributeFormValues>({
    resolver: zodResolver(CreateAttributeSchema),
    defaultValues: { code: "", displayName: "", dataType: "TEXT", canonicalUnit: "" },
  });
  const dataType = form.watch("dataType");
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.pending) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Create Attribute</DialogTitle><DialogDescription>Define a reusable product specification. Code, type, and unit cannot be changed after creation.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((input) => mutation.run(() => createAttribute(input), (result) => {
            if (result.success) { router.push(`/dashboard/admin/attributes/${result.data.id}`); onClose(); }
          }))}>
            <fieldset disabled={mutation.pending} className="space-y-4">
              <FormField control={form.control} name="displayName" render={({ field }) => (
                <FormItem><FormLabel>Display Name</FormLabel><FormControl><Input placeholder="Memory Capacity" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem><FormLabel>Code</FormLabel><FormControl><Input placeholder="ram_capacity" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dataType" render={({ field }) => (
                <FormItem><FormLabel>Data Type</FormLabel>
                  <Select value={field.value} disabled={mutation.pending} onValueChange={(value) => {
                    field.onChange(value);
                    if (value !== "NUMBER") form.setValue("canonicalUnit", "", { shouldValidate: true });
                  }}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{["TEXT", "ENUM", "NUMBER", "BOOLEAN", "DATE"].map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              {dataType === "NUMBER" && <FormField control={form.control} name="canonicalUnit" render={({ field }) => (
                <FormItem><FormLabel>Unit (optional)</FormLabel><FormControl><Input placeholder="GB" {...field} /></FormControl><FormMessage /></FormItem>
              )} />}
            </fieldset>
            <MutationError message={mutation.error} />
            <DialogFooter><Button type="button" variant="secondary" disabled={mutation.pending} onClick={onClose}>Cancel</Button><Button disabled={mutation.pending}>{mutation.pending ? "Creating..." : "Create Attribute"}</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
