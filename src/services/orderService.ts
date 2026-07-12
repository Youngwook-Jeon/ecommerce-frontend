"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  OrderResponseSchema,
  PlaceOrderInputSchema,
  type OrderVm,
  type PlaceOrderInput,
} from "@/common/schemas/order";
import { fetchWrapper } from "@/common/services/fetchWrapper";

const ORDERS_PATH = "api/v1/order_service/orders";

const mutationFetchOptions = {
  cache: "no-store" as const,
  forwardResponseCookies: true,
};

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

export async function placeOrder(input: PlaceOrderInput): Promise<OrderVm> {
  const payload = PlaceOrderInputSchema.parse(input);
  const response = await fetchWrapper.post(ORDERS_PATH, payload, mutationFetchOptions);
  const order = await parseJsonResponse(response, OrderResponseSchema, "place order");
  revalidateOrderPaths();
  return order;
}

export async function getOrder(orderId: string): Promise<OrderVm> {
  const response = await fetchWrapper.get(`${ORDERS_PATH}/${orderId}`, {
    cache: "no-store",
  });
  return parseJsonResponse(response, OrderResponseSchema, "order");
}

function revalidateOrderPaths() {
  revalidatePath("/cart", "layout");
  revalidatePath("/cart");
  revalidatePath("/checkout");
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
