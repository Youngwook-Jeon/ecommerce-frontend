import { cookies } from "next/headers";

export const BASE_API_URL = "http://localhost:9000/";
export const XSRF_COOKIE_NAME = "XSRF-TOKEN";
export const XSRF_TOKEN_HEADER = "X-XSRF-TOKEN";
export const SESSION_COOKIE_NAME = "SESSION_edge-service";

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
  options: RequestInit = {}
) {
  const allCookies = await getAllCookies();
  const csrfToken = allCookies[XSRF_COOKIE_NAME] || "";
  const sessionToken = allCookies[SESSION_COOKIE_NAME] || "temp";

  const requestCookies = {
    [SESSION_COOKIE_NAME]: sessionToken,
    ...allCookies,
  };

  const cookieString = Object.entries(requestCookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

  const headers = {
    ...options.headers,
    cookie: cookieString,
    [XSRF_TOKEN_HEADER]: csrfToken,
    "Content-Type": "application/json",
  };

  const requestOptions: RequestInit = {
    method,
    headers,
    credentials: "include",
    ...options,
  };
  console.log("requestOptions:", requestOptions);

  if (method !== "GET" && method !== "DELETE") {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(BASE_API_URL + url, requestOptions);
    if (response.type == "cors" && response.redirected) {
      window.location.href = response.url;
    }

    return response;
  } catch (error) {
    console.error("fetch request error: ", error);
    throw error;
  }
}

export const fetchWrapper = {
  get: (url: string, options = {}) => request(url, "GET", {}, options),
  post: (url: string, body = {}, options = {}) =>
    request(url, "POST", body, options),
  put: (url: string, body = {}, options = {}) =>
    request(url, "PUT", body, options),
  del: (url: string, options = {}) => request(url, "DELETE", {}, options),
};
