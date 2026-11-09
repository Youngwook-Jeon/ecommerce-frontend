import { z } from "zod";
import { AttributeDefinitionSchema, AttributeValueSchema } from "./attributeCatalog";

export const ProductSpecificationsSchema = z.object({
  productId: z.string().uuid(),
  version: z.number().int().positive().safe(),
  specifications: z.array(z.object({
    attribute: AttributeDefinitionSchema,
    value: AttributeValueSchema,
  }).refine(({ attribute, value }) => attribute.id === value.attributeId && attribute.dataType === value.dataType,
    "The specification value does not match its attribute.")),
});

export type ProductSpecificationsVm = z.infer<typeof ProductSpecificationsSchema>;
