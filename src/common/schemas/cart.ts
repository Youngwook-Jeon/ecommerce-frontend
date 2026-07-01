import { z } from "zod";

export const CartItemOptionResponseSchema = z.object({
  stepOrder: z.number().int(),
  productOptionGroupId: z.string().uuid(),
  optionGroupName: z.string(),
  productOptionValueId: z.string().uuid(),
  optionValueName: z.string(),
});

export const CartItemResponseSchema = z.object({
  itemId: z.string().uuid(),
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

export const CartResponseSchema = z.object({
  cartId: z.string().uuid().nullable(),
  ownerType: z.enum(["USER", "GUEST"]),
  userId: z.string().nullable(),
  items: z.array(CartItemResponseSchema),
  itemCount: z.number().int().nonnegative(),
  totalQuantity: z.number().int().nonnegative(),
  subtotal: z.number(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const CartSyncChangeTypeSchema = z.enum([
  "PRICE_UPDATED",
  "SNAPSHOT_UPDATED",
  "QUANTITY_ADJUSTED",
  "REMOVED",
]);

export const CartSyncRemovalReasonSchema = z.enum([
  "OUT_OF_STOCK",
  "NOT_PURCHASABLE",
  "PRODUCT_NOT_FOUND",
  "VARIANT_NOT_FOUND",
]);

export const CartSyncChangeResponseSchema = z.object({
  type: CartSyncChangeTypeSchema,
  itemId: z.string().uuid(),
  previousPrice: z.number().nullable().optional(),
  currentPrice: z.number().nullable().optional(),
  previousQuantity: z.number().int().nullable().optional(),
  currentQuantity: z.number().int().nullable().optional(),
  productName: z.string().nullable().optional(),
  removalReason: CartSyncRemovalReasonSchema.nullable().optional(),
});

export const CartSyncResponseSchema = z.object({
  cart: CartResponseSchema,
  changes: z.array(CartSyncChangeResponseSchema),
});

export const AddCartItemInputSchema = z.object({
  productId: z.string().uuid(),
  productVariantId: z.string().uuid(),
  quantity: z.number().int().positive(),
});

export type AddCartItemInput = z.infer<typeof AddCartItemInputSchema>;

export type CartItemOptionVm = z.infer<typeof CartItemOptionResponseSchema>;
export type CartItemVm = z.infer<typeof CartItemResponseSchema>;
export type CartVm = z.infer<typeof CartResponseSchema>;
export type CartSyncChangeVm = z.infer<typeof CartSyncChangeResponseSchema>;
export type CartSyncVm = z.infer<typeof CartSyncResponseSchema>;

export const EMPTY_CART: CartVm = {
  cartId: null,
  ownerType: "GUEST",
  userId: null,
  items: [],
  itemCount: 0,
  totalQuantity: 0,
  subtotal: 0,
  createdAt: null,
  updatedAt: null,
};
