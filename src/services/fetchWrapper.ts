import { cookies } from "next/headers";

export const BASE_API_URL = "http://localhost:9000/";
export const XSRF_COOKIE_NAME = "XSRF-TOKEN";
export const XSRF_TOKEN_HEADER = "X-XSRF-TOKEN";
// export const SESSION_COOKIE_NAME = "SESSION";
export const SESSION_COOKIE_NAME = "SESSION_edge-service";

export async function getAllCookies() {
  const cookieStore = await cookies() ;
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
    if (response.type == 'cors' && response.redirected) {
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

// export function getTokenFromCookie(name: string) {
//     const cookieStore = cookies();
//     const cookie = cookieStore.get(name);
//     const token = cookie?.value ? cookie.value : "";

//     return token;
//   }

// async function get(url: string, options = {}) {
//   const requestOptions: RequestInit = {
//     method: "GET",
//     ...options,
//     credentials: "include"
//   };

//   const response = await fetch(BASE_API_URL + url, requestOptions);

//   return response;
// }

// async function post(url: string, body = {}, options = {}) {
//   const csrfToken = getTokenFromCookie(XSRF_COOKIE_NAME);
//   const requestOptions: RequestInit = {
//     method: "POST",
//     headers: {
//       [XSRF_TOKEN_HEADER]: csrfToken,
//     },
//     body: JSON.stringify(body),
//     ...options,
//     credentials: "include"
//   };

//   const response = await fetch(BASE_API_URL + url, requestOptions);

//   return response;
// }

// async function put(url: string, body = {}, options = {}) {
//   const csrfToken = getTokenFromCookie(XSRF_COOKIE_NAME);
//   const requestOptions = {
//     method: "PUT",
//     headers: {
//       ...options,
//       cookie: cookies().toString(),
//       [XSRF_TOKEN_HEADER]: csrfToken,
//     },
//     body: JSON.stringify(body),
//   };

//   const response = await fetch(BASE_API_URL + url, requestOptions);

//   return response;
// }

// async function del(url: string, options = {}) {
//   const csrfToken = getTokenFromCookie(XSRF_COOKIE_NAME);
//   const requestOptions = {
//     method: "DELETE",
//     headers: {
//       ...options,
//       cookie: cookies().toString(),
//       [XSRF_TOKEN_HEADER]: csrfToken,
//     },
//   };

//   const response = await fetch(BASE_API_URL + url, requestOptions);

//   return response;
// }

// export const fetchWrapper = {
//   get,
//   post,
//   put,
//   del,
// };
