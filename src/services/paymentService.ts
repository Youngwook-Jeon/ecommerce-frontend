"use server";

import {
  ClientSecretResponseSchema,
  type ClientSecretVm,
} from "@/common/schemas/payment";
import { fetchWrapper } from "@/common/services/fetchWrapper";

const clientSecretPath = (orderId: string) =>
  `api/v1/payment_service/payments/orders/${orderId}/client-secret`;

export async function getClientSecretByOrderId(orderId: string): Promise<ClientSecretVm> {
  const response = await fetchWrapper.get(clientSecretPath(orderId), {
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(parseApiErrorMessage("get client secret", response, body));
  }

  const data = await response.json();
  const parsed = ClientSecretResponseSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Invalid client-secret response:", parsed.error);
    throw new Error("Invalid data format for client secret");
  }

  return parsed.data;
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
