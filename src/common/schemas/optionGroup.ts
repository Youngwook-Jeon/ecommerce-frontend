import { z } from "zod";

export const OptionStatusSchema = z.enum(["ACTIVE", "INACTIVE", "DELETED"]);
export type OptionStatus = z.infer<typeof OptionStatusSchema>;

export const OptionValueSchema = z.object({
  id: z.string().uuid(),
  value: z.string(),
  displayName: z.string(),
  sortOrder: z.number(),
  status: OptionStatusSchema,
});
export type OptionValueVm = z.infer<typeof OptionValueSchema>;

export const OptionGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  displayName: z.string(),
  status: OptionStatusSchema,
  optionValues: z.array(OptionValueSchema),
});
export type OptionGroupVm = z.infer<typeof OptionGroupSchema>;

export const OptionGroupListSchema = z.object({
  optionGroups: z.array(OptionGroupSchema),
});

export const CreateOptionGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name must be 100 characters or less."),
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(100, "Display name must be 100 characters or less."),
});
export type CreateOptionGroupForm = z.infer<typeof CreateOptionGroupSchema>;

export const UpdateOptionGroupSchema = CreateOptionGroupSchema.extend({
  status: OptionStatusSchema,
});
export type UpdateOptionGroupForm = z.infer<typeof UpdateOptionGroupSchema>;

const OptionValueInputSchema = z.object({
  value: z
    .string()
    .trim()
    .min(2, "Value must be at least 2 characters.")
    .max(100, "Value must be 100 characters or less."),
  displayName: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(100, "Display name must be 100 characters or less."),
  sortOrder: z.coerce
    .number()
    .int("Sort order must be an integer.")
    .min(0, "Sort order must be 0 or greater."),
});

export const AddOptionValuesSchema = z.object({
  optionValues: z.array(OptionValueInputSchema).min(1, "Add at least one option value."),
});
export type AddOptionValuesForm = z.infer<typeof AddOptionValuesSchema>;

export const UpdateOptionValueSchema = OptionValueInputSchema.extend({
  status: OptionStatusSchema,
});
export type UpdateOptionValueForm = z.infer<typeof UpdateOptionValueSchema>;
