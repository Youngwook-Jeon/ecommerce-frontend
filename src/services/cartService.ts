"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  AddCartItemInputSchema,
  CartMergeResponseSchema,
  CartResponseSchema,
  CartSyncResponseSchema,
  EMPTY_CART,
  type AddCartItemInput,
  type CartMergeVm,
  type CartSyncVm,
  type CartVm,
} from "@/common/schemas/cart";
import { fetchWrapper } from "@/common/services/fetchWrapper";

const CART_CURRENT_PATH = "api/v1/order_service/carts/current";

async function parseJsonResponse<T>(
  response: Response,
  schema: z.ZodType<T>,
  label: string
): Promise<T> {
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(parseApiErrorMessage(label, response, body));
  }

  const data = await response.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success || parsed.data === undefined) {
    console.error(`Invalid ${label} response:`, parsed.error);
    throw new Error(`Invalid data format for ${label}`);
  }

  return parsed.data;
}

export async function getCurrentCart(): Promise<CartVm> {
  const response = await fetchWrapper.get(CART_CURRENT_PATH, {
    cache: "no-store",
  });
  return parseJsonResponse(response, CartResponseSchema, "cart");
}

export async function getCurrentCartSafe(): Promise<CartVm> {
  try {
    return await getCurrentCart();
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return EMPTY_CART;
  }
}

const mutationFetchOptions = {
  cache: "no-store" as const,
  forwardResponseCookies: true,
};

export async function syncCurrentCart(): Promise<CartSyncVm> {
  const response = await fetchWrapper.post(`${CART_CURRENT_PATH}/sync`, {}, mutationFetchOptions);
  return parseJsonResponse(response, CartSyncResponseSchema, "cart sync");
}

export async function mergeGuestCartOnLogin(): Promise<CartMergeVm> {
  const response = await fetchWrapper.post(
    `${CART_CURRENT_PATH}/merge`,
    {},
    mutationFetchOptions
  );
  const result = await parseJsonResponse(
    response,
    CartMergeResponseSchema,
    "merge guest cart on login"
  );
  revalidateCartPaths();
  return result;
}

export async function mergeGuestCartOnLoginSafe(): Promise<CartMergeVm | null> {
  try {
    return await mergeGuestCartOnLogin();
  } catch (error) {
    console.error("Failed to merge guest cart on login:", error);
    return null;
  }
}

export async function addCartItem(input: AddCartItemInput): Promise<CartVm> {
  const payload = AddCartItemInputSchema.parse(input);
  const response = await fetchWrapper.post(
    `${CART_CURRENT_PATH}/items`,
    payload,
    mutationFetchOptions
  );
  const cart = await parseJsonResponse(response, CartResponseSchema, "add cart item");
  revalidateCartPaths();
  return cart;
}

export async function removeCartItem(itemId: string): Promise<CartVm> {
  const response = await fetchWrapper.del(
    `${CART_CURRENT_PATH}/items/${itemId}`,
    mutationFetchOptions
  );
  const cart = await parseJsonResponse(response, CartResponseSchema, "remove cart item");
  revalidateCartPaths();
  return cart;
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<CartVm> {
  const response = await fetchWrapper.patch(
    `${CART_CURRENT_PATH}/items/${itemId}`,
    { quantity },
    mutationFetchOptions
  );
  const cart = await parseJsonResponse(
    response,
    CartResponseSchema,
    "update cart item quantity"
  );
  revalidateCartPaths();
  return cart;
}

export async function clearCart(): Promise<CartVm> {
  const response = await fetchWrapper.del(
    `${CART_CURRENT_PATH}/items`,
    mutationFetchOptions
  );
  const cart = await parseJsonResponse(response, CartResponseSchema, "clear cart");
  revalidateCartPaths();
  return cart;
}

function revalidateCartPaths() {
  revalidatePath("/cart", "layout");
  revalidatePath("/cart");
  revalidatePath("/products", "layout");
}

function parseApiErrorMessage(
  label: string,
  response: Response,
  body: string
): string {
  if (body) {
    try {
      const parsed = JSON.parse(body) as { message?: string };
      if (parsed.message) {
        return parsed.message;
      }
    } catch {
      // fall through to generic message
    }
  }

  return `Failed to ${label}: ${response.status} ${response.statusText}`;
}
