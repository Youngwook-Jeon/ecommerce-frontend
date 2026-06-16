import { BASE_API_URL } from "@/common/services/fetchWrapper";

export interface PublicFetchInit extends Omit<RequestInit, "method" | "body"> {
  next?: NextFetchRequestConfig;
}

/**
 * Cookie-free GET for anonymous storefront APIs.
 * Avoids pulling in `cookies()` so routes can use Next.js fetch caching / ISR.
 */
export async function publicGet(
  path: string,
  init: PublicFetchInit = {}
): Promise<Response> {
  const { next, headers, ...rest } = init;

  return fetch(BASE_API_URL + path, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...headers,
    },
    ...rest,
    next,
  });
}
