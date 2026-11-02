import { z } from "zod";

export const OptionStatusSchema = z.enum(["ACTIVE", "INACTIVE", "DELETED"]);
export type OptionStatus = z.infer<typeof OptionStatusSchema>;

export const OptionValueSchema = z.object({
  id: z.string().uuid(),
  attributeValueId: z.string().uuid().nullable(),
  value: z.string(),
  displayName: z.string(),
  sortOrder: z.number(),
  status: OptionStatusSchema,
});
export type OptionValueVm = z.infer<typeof OptionValueSchema>;

export const OptionGroupSchema = z.object({
  id: z.string().uuid(),
  attributeId: z.string().uuid().nullable(),
  version: z.number().int().nonnegative(),
  name: z.string(),
  displayName: z.string(),
  status: OptionStatusSchema,
  optionValues: z.array(OptionValueSchema),
});
export type OptionGroupVm = z.infer<typeof OptionGroupSchema>;

export const OptionGroupListSchema = z.object({
  optionGroups: z.array(OptionGroupSchema),
});

const OptionGroupInputSchema = z.object({
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
export const CreateOptionGroupSchema = OptionGroupInputSchema.extend({
  attributeId: z.string().uuid("Select an attribute definition."),
});
export type CreateOptionGroupForm = z.infer<typeof CreateOptionGroupSchema>;

export const UpdateOptionGroupSchema = OptionGroupInputSchema.extend({
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
  optionValues: z.array(OptionValueInputSchema.extend({
    attributeValueId: z.string().uuid("Select an attribute value."),
  })).min(1, "Add at least one option value.").superRefine((values, context) => {
    const selected = new Set<string>();
    values.forEach((value, index) => {
      if (selected.has(value.attributeValueId)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index, "attributeValueId"],
          message: "Select each attribute value only once.",
        });
      }
      selected.add(value.attributeValueId);
    });
  }),
});
export type AddOptionValuesForm = z.infer<typeof AddOptionValuesSchema>;

export const UpdateOptionValueSchema = OptionValueInputSchema.extend({
  status: OptionStatusSchema,
});
export type UpdateOptionValueForm = z.infer<typeof UpdateOptionValueSchema>;
