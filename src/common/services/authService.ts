/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { AuthUserInfoSchema, AuthUserInfoVm } from "../schemas/auth";
import { fetchWrapper } from "./fetchWrapper";

async function loggedFetch(url: string, method: string, options?: RequestInit) {
  const startTime = Date.now();

  try {
    // Request header logging
    console.log("Request URL:", url);
    console.log("Request obj:", options);
    console.log("Request Headers:", options?.headers);
    console.log("Request body:", options?.body);

    const response = await fetch(url, {
      method,
      ...options,
      headers: {
        ...options?.headers,
      },
    });

    // Response header logging
    console.log("Response Status:", response.status);
    console.log("Response Headers:", Object.fromEntries(response.headers));

    const endTime = Date.now();
    console.log(`Request Duration: ${endTime - startTime}ms`);

    return response;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error;
  }
}

export async function getAuthUserInfo(): Promise<AuthUserInfoVm> {
  const response = await fetchWrapper.get("authentication", {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch auth user info: ${response.statusText}`);
  }

  const data = await response.json();

  const parsed = AuthUserInfoSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Validation errors:", parsed.error);
    throw new Error("Invalid data format for AuthUserInfoVm");
  }

  return parsed.data;
}
