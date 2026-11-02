import { z } from "zod";

const AttributeDataTypeSchema = z.enum(["TEXT", "ENUM", "NUMBER", "BOOLEAN", "DATE"]);

export const AttributeDefinitionSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  displayName: z.string(),
  dataType: AttributeDataTypeSchema,
  canonicalUnit: z.string().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export const AttributeValueSchema = z.object({
  id: z.string().uuid(),
  attributeId: z.string().uuid(),
  dataType: AttributeDataTypeSchema,
  displayName: z.string(),
  textValue: z.string().nullable(),
  numericValue: z.number().nullable(),
  booleanValue: z.boolean().nullable(),
  dateValue: z.string().nullable(),
});

export type AttributeDefinitionVm = z.infer<typeof AttributeDefinitionSchema>;
export type AttributeValueVm = z.infer<typeof AttributeValueSchema>;

export const AttributeNameSchema = z.object({
  displayName: z.string().trim().min(1, "Enter a display name.").max(100),
});

export const CreateAttributeSchema = AttributeNameSchema.extend({
  code: z.string().regex(/^[a-z][a-z0-9_]{0,99}$/, "Use a lowercase code starting with a letter, up to 100 characters."),
  dataType: AttributeDataTypeSchema,
  canonicalUnit: z.string().trim().max(20),
}).superRefine((value, context) => {
  if (value.dataType !== "NUMBER" && value.canonicalUnit) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["canonicalUnit"], message: "Only numeric attributes can have a unit." });
  }
});

export const AttributeValueInputSchema = AttributeNameSchema.extend({
  dataType: AttributeDataTypeSchema,
  rawValue: z.string().trim().min(1, "Enter a value."),
}).superRefine((value, context) => {
  let message: string | undefined;
  switch (value.dataType) {
    case "TEXT":
    case "ENUM":
      if (value.rawValue.length > 100) message = "Use at most 100 characters.";
      break;
    case "NUMBER":
      if (!/^-?\d{1,13}(\.\d{1,6})?$/.test(value.rawValue)) {
        message = "Use up to 13 integer digits and 6 decimal places.";
      }
      break;
    case "BOOLEAN":
      if (!["true", "false"].includes(value.rawValue)) message = "Select true or false.";
      break;
    case "DATE": {
      const date = new Date(`${value.rawValue}T00:00:00Z`);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value.rawValue) || value.rawValue.startsWith("0000") ||
          !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value.rawValue) {
        message = "Enter a valid date between years 0001 and 9999.";
      }
      break;
    }
  }
  if (message) context.addIssue({ code: z.ZodIssueCode.custom, path: ["rawValue"], message });
});

export function toAttributeValueRequest(input: z.infer<typeof AttributeValueInputSchema>) {
  const value = AttributeValueInputSchema.parse(input);
  return {
    displayName: value.displayName,
    textValue: ["TEXT", "ENUM"].includes(value.dataType) ? value.rawValue : null,
    // Keep decimals as strings so JSON serialization does not round BigDecimal input.
    numericValue: value.dataType === "NUMBER" ? value.rawValue : null,
    booleanValue: value.dataType === "BOOLEAN" ? value.rawValue === "true" : null,
    dateValue: value.dataType === "DATE" ? value.rawValue : null,
  };
}

export const CategoryAttributePolicySchema = z.object({
  enabled: z.boolean(),
  required: z.boolean(),
  optionAllowed: z.boolean(),
  filterable: z.boolean(),
  displayOrder: z.number().int().nonnegative().max(2147483647),
}).superRefine((value, context) => {
  if (!value.enabled && (value.required || value.optionAllowed || value.filterable)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["enabled"], message: "Disabled policies cannot require attributes or allow options or filtering." });
  }
});

export const CategoryAttributeSchema = z.object({
  attribute: AttributeDefinitionSchema,
  policy: z.object({
    attributeId: z.string().uuid(),
    enabled: z.boolean(),
    required: z.boolean(),
    optionAllowed: z.boolean(),
    filterable: z.boolean(),
    displayOrder: z.number().int().nonnegative(),
    usable: z.boolean(),
    optionAvailable: z.boolean(),
    filterAvailable: z.boolean(),
  }),
}).refine((value) => value.attribute.id === value.policy.attributeId, "The policy attribute does not match its definition.");

export type CreateAttributeFormValues = z.infer<typeof CreateAttributeSchema>;
export type AttributeValueFormValues = z.infer<typeof AttributeValueInputSchema>;
export type CategoryAttributeVm = z.infer<typeof CategoryAttributeSchema>;
export type CategoryAttributePolicyInput = z.infer<typeof CategoryAttributePolicySchema>;
