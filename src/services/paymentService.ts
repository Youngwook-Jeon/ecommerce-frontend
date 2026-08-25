"use server";

import {
  ClientSecretResponseSchema,
  type ClientSecretVm,
} from "@/common/schemas/payment";
import { fetchWrapper } from "@/common/services/fetchWrapper";

const clientSecretPath = (orderId: string) =>
  `api/v1/payment_service/payments/orders/${orderId}/client-secret`;

export type ClientSecretLookupResult =
  | { status: "ready"; data: ClientSecretVm }
  /** Payment / clientSecret not created yet (CDC lag). Safe to poll again. */
  | { status: "pending"; message: string }
  | { status: "error"; message: string };

/**
 * Looks up the Embedded Elements client secret.
 * Does not throw for expected "not ready yet" (404) so Next server-action logs stay quiet.
 */
export async function getClientSecretByOrderId(
  orderId: string
): Promise<ClientSecretLookupResult> {
  const response = await fetchWrapper.get(clientSecretPath(orderId), {
    cache: "no-store",
  });

  if (response.status === 404) {
    const body = await response.text().catch(() => "");
    return {
      status: "pending",
      message: parseApiErrorMessage("get client secret", response, body),
    };
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    return {
      status: "error",
      message: parseApiErrorMessage("get client secret", response, body),
    };
  }

  const data = await response.json();
  const parsed = ClientSecretResponseSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Invalid client-secret response:", parsed.error);
    return { status: "error", message: "Invalid data format for client secret" };
  }

  return { status: "ready", data: parsed.data };
}

function parseApiErrorMessage(label: string, response: Response, body: string): string {
  if (body) {
    try {
      const parsed = JSON.parse(body) as { message?: string };
      if (parsed.message) {
        return parsed.message;
      }
    } catch {
      // fall through
    }
  }

  return `Failed to ${label}: ${response.status} ${response.statusText}`;
}
