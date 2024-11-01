import { cookies } from "next/headers";

export const BASE_API_URL = "http://localhost:9000/";
export const XSRF_COOKIE_NAME = "XSRF-TOKEN";
export const XSRF_TOKEN_HEADER = "X-XSRF-TOKEN";

export function getTokenFromCookie(name: string) {
    const cookieStore = cookies();
    const cookie = cookieStore.get(name);
    const token = cookie?.value ? cookie.value : "";
  
    return token;
  }

async function get(url: string, options = {}) {
  const requestOptions = {
    method: "GET",
    headers: { ...options, cookie: cookies().toString() },
  };

  const response = await fetch(BASE_API_URL + url, requestOptions);

  return response;
}

async function post(url: string, body = {}, options = {}) {
  const csrfToken = getTokenFromCookie(XSRF_COOKIE_NAME);
  const requestOptions = {
    method: "POST",
    headers: {
      ...options,
      cookie: cookies().toString(),
      [XSRF_TOKEN_HEADER]: csrfToken,
    },
    body: JSON.stringify(body),
  };

  const response = await fetch(BASE_API_URL + url, requestOptions);

  return response;
}

async function put(url: string, body: object, options = {}) {
  const csrfToken = getTokenFromCookie(XSRF_COOKIE_NAME);
  const requestOptions = {
    method: "PUT",
    headers: {
      ...options,
      cookie: cookies().toString(),
      [XSRF_TOKEN_HEADER]: csrfToken,
    },
    body: JSON.stringify(body),
  };

  const response = await fetch(BASE_API_URL + url, requestOptions);

  return response;
}

async function del(url: string, options = {}) {
  const csrfToken = getTokenFromCookie(XSRF_COOKIE_NAME);
  const requestOptions = {
    method: "DELETE",
    headers: {
      ...options,
      cookie: cookies().toString(),
      [XSRF_TOKEN_HEADER]: csrfToken,
    },
  };

  const response = await fetch(BASE_API_URL + url, requestOptions);

  return response;
}

export const fetchWrapper = {
  get,
  post,
  put,
  del,
};
