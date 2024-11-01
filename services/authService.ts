/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { AuthUserInfoVm } from "@/lib/types";
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
  let authUserInfo: AuthUserInfoVm = {
    isAuthenticated: false,
    username: "",
  };
  try {
    //   const response = await loggedFetch(
    //     "http://localhost:9000/authentication",
    //     {
    //       cache: "no-store",
    //       credentials: "include",
    //       headers: {
    //         cookie: cookies().toString()
    //       },
    //     }
    //   );
    const response = await fetchWrapper.get("authentication", {
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Error to fetch auth user info");

    authUserInfo = await response.json();
  } catch (error) {
    console.log("Fetch auth user info error:", error);
  }

  return authUserInfo;
}
