import { z } from "zod";

const ProductIdParamSchema = z.string().uuid();

/**
 * Validates route param as a UUID before calling the product detail API.
 */
export function parseProductIdParam(raw: string): string | null {
  const parsed = ProductIdParamSchema.safeParse(raw.trim());
  return parsed.success ? parsed.data : null;
}
