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
