import { z } from "zod";

import { CartItemOptionResponseSchema } from "@/common/schemas/cart";

export const OrderStatusSchema = z.enum([
  "PENDING_PAYMENT",
  "CONFIRMED",
  "CANCELLED",
  "EXPIRED",
]);

export const ShippingAddressResponseSchema = z.object({
  recipientName: z.string(),
  phone: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable().optional(),
  city: z.string(),
  postalCode: z.string(),
  countryCode: z.string(),
});

export const OrderLineResponseSchema = z.object({
  lineId: z.string().uuid(),
  productId: z.string().uuid(),
  productVariantId: z.string().uuid(),
  productName: z.string(),
  brand: z.string().nullable(),
  sku: z.string(),
  imageUrl: z.string().nullable(),
  unitPrice: z.number(),
  quantity: z.number().int().positive(),
  lineAmount: z.number(),
  variantOptions: z.array(CartItemOptionResponseSchema),
});

export const OrderResponseSchema = z.object({
  orderId: z.string().uuid(),
  userId: z.string(),
  status: OrderStatusSchema,
  subtotal: z.number(),
  shippingAmount: z.number(),
  totalAmount: z.number(),
  shippingAddress: ShippingAddressResponseSchema,
  lines: z.array(OrderLineResponseSchema),
  lineCount: z.number().int().nonnegative(),
  totalQuantity: z.number().int().nonnegative(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const PlaceOrderInputSchema = z.object({
  recipientName: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(30),
  addressLine1: z.string().trim().min(1).max(255),
  addressLine2: z.string().trim().max(255).optional(),
  city: z.string().trim().min(1).max(100),
  postalCode: z.string().trim().min(1).max(20),
  countryCode: z.string().trim().length(2),
});

export type OrderVm = z.infer<typeof OrderResponseSchema>;
export type OrderLineVm = z.infer<typeof OrderLineResponseSchema>;
export type PlaceOrderInput = z.infer<typeof PlaceOrderInputSchema>;
