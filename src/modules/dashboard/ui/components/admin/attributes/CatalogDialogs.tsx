"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AttributeNameSchema } from "@/common/schemas/attributeCatalog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CatalogActionResult, useCatalogMutation } from "./useCatalogMutation";
import { MutationError } from "./CatalogFeedback";

export function RenameCatalogDialog({ title, displayName, onSave, onClose }: {
  title: string;
  displayName: string;
  onSave: (input: { displayName: string }) => Promise<CatalogActionResult>;
  onClose: () => void;
}) {
  const mutation = useCatalogMutation();
  const form = useForm<{ displayName: string }>({
    resolver: zodResolver(AttributeNameSchema), defaultValues: { displayName },
  });
  return (
    <Dialog open onOpenChange={(open) => { if (!open && !mutation.pending) onClose(); }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>Change the display name while preserving the existing meaning and value.</DialogDescription></DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit((input) => mutation.run(() => onSave(input), onClose))}>
            <FormField control={form.control} name="displayName" render={({ field }) => (
              <FormItem><FormLabel>Display Name</FormLabel><FormControl><Input {...field} disabled={mutation.pending} /></FormControl><FormMessage /></FormItem>
            )} />
            <MutationError message={mutation.error} />
            <DialogFooter>
              <Button type="button" variant="secondary" disabled={mutation.pending} onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={mutation.pending}>{mutation.pending ? "Saving..." : "Save Name"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmCatalogAction({ title, description, actionLabel, action, onClose, onSuccess }: {
  title: string;
  description: string;
  actionLabel: string;
  action: () => Promise<CatalogActionResult>;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const mutation = useCatalogMutation();
  return (
    <AlertDialog open onOpenChange={(open) => { if (!open && !mutation.pending) onClose(); }}>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader>
        <MutationError message={mutation.error} />
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.pending}>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={mutation.pending} onClick={(event) => {
            event.preventDefault();
            void mutation.run(action, () => { onSuccess?.(); onClose(); });
          }}>{mutation.pending ? "Saving..." : actionLabel}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
