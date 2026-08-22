import { z } from "zod";

export const PaymentProviderSchema = z.enum(["STUB", "STRIPE"]);

export const ClientSecretResponseSchema = z.object({
  paymentId: z.string().uuid(),
  orderId: z.string().uuid(),
  provider: PaymentProviderSchema,
  clientSecret: z.string().min(1),
  status: z.string().min(1),
});

export type ClientSecretVm = z.infer<typeof ClientSecretResponseSchema>;
export type PaymentProvider = z.infer<typeof PaymentProviderSchema>;
