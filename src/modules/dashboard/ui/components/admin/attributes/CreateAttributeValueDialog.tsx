"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AttributeDefinitionVm, AttributeValueFormValues, AttributeValueInputSchema } from "@/common/schemas/attributeCatalog";
import { createAttributeValue } from "@/services/attributeCatalogService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCatalogMutation } from "./useCatalogMutation";
import { MutationError } from "./CatalogFeedback";

export function CreateAttributeValueDialog({ definition, onClose }: { definition: AttributeDefinitionVm; onClose: () => void }) {
  const mutation = useCatalogMutation();
  const form = useForm<AttributeValueFormValues>({
    resolver: zodResolver(AttributeValueInputSchema),
    defaultValues: { displayName: "", dataType: definition.dataType, rawValue: "" },
  });
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.pending) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>Add Attribute Value</DialogTitle><DialogDescription>Add a standard value for {definition.displayName}. The stored value cannot be changed after creation.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((input) => mutation.run(() => createAttributeValue(definition.id, input), onClose))}>
            <FormField control={form.control} name="displayName" render={({ field }) => (
              <FormItem><FormLabel>Display Name</FormLabel><FormControl><Input {...field} disabled={mutation.pending} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="rawValue" render={({ field }) => (
              <FormItem><FormLabel>Value{definition.canonicalUnit ? ` (${definition.canonicalUnit})` : ""}</FormLabel>
                {definition.dataType === "BOOLEAN" ? (
                  <Select value={field.value} onValueChange={field.onChange} disabled={mutation.pending}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a value" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="true">True</SelectItem><SelectItem value="false">False</SelectItem></SelectContent>
                  </Select>
                ) : (
                  <FormControl><Input {...field} disabled={mutation.pending} type={definition.dataType === "DATE" ? "date" : "text"} inputMode={definition.dataType === "NUMBER" ? "decimal" : undefined} min={definition.dataType === "DATE" ? "0001-01-01" : undefined} max={definition.dataType === "DATE" ? "9999-12-31" : undefined} /></FormControl>
                )}
                <FormMessage />
              </FormItem>
            )} />
            <MutationError message={mutation.error} />
            <DialogFooter><Button type="button" variant="secondary" disabled={mutation.pending} onClick={onClose}>Cancel</Button><Button disabled={mutation.pending || definition.status !== "ACTIVE"}>{mutation.pending ? "Saving..." : "Add Value"}</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
