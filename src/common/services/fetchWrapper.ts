import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { applyResponseCookies } from "@/common/services/applyResponseCookies";

export const BASE_API_URL = "http://localhost:9000/";
export const XSRF_COOKIE_NAME = "XSRF-TOKEN";
export const XSRF_TOKEN_HEADER = "X-XSRF-TOKEN";
export const SESSION_COOKIE_NAME = "SESSION_edge-service";

export type FetchWrapperOptions = RequestInit & {
  /** Only Server Actions / Route Handlers should enable this. */
  forwardResponseCookies?: boolean;
};

export async function getAllCookies() {
  const cookieStore = await cookies();
  const allCookiesArray = cookieStore.getAll();

  return allCookiesArray.reduce((acc, { name, value }) => {
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);
}

async function request(
  url: string,
  method: string,
  body: object = {},
  options: FetchWrapperOptions = {}
) {
  const { forwardResponseCookies = false, ...fetchOptions } = options;
  const allCookies = await getAllCookies();
  const csrfToken = allCookies[XSRF_COOKIE_NAME] || "";

  const cookieString = Object.entries(allCookies)
    .filter(([, value]) => value.length > 0)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

  const headers: Record<string, string> = {
    [XSRF_TOKEN_HEADER]: csrfToken,
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string> | undefined),
  };

  if (cookieString.length > 0) {
    headers.cookie = cookieString;
  }

  const requestOptions: RequestInit = {
    method,
    headers,
    credentials: "include",
    ...fetchOptions,
  };

  if (method !== "GET" && method !== "DELETE") {
    requestOptions.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(BASE_API_URL + url, requestOptions);
  } catch (error) {
    console.error("fetch request error: ", error);
    throw error;
  }

  if (forwardResponseCookies) {
    await applyResponseCookies(response);
  }

  if (response.redirected) {
    redirect(response.url);
  }

  return response;
}

export const fetchWrapper = {
  get: (url: string, options: FetchWrapperOptions = {}) =>
    request(url, "GET", {}, options),
  post: (url: string, body = {}, options: FetchWrapperOptions = {}) =>
    request(url, "POST", body, options),
  put: (url: string, body = {}, options: FetchWrapperOptions = {}) =>
    request(url, "PUT", body, options),
  patch: (url: string, body = {}, options: FetchWrapperOptions = {}) =>
    request(url, "PATCH", body, options),
  del: (url: string, options: FetchWrapperOptions = {}) =>
    request(url, "DELETE", {}, options),
};
