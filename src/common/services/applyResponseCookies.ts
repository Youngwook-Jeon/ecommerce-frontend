import { cookies } from "next/headers";

export const GUEST_CART_COOKIE_NAME = "guest_cart_id";

interface ParsedSetCookie {
  name: string;
  value: string;
  path?: string;
  maxAge?: number;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "lax" | "strict" | "none";
}

function getSetCookieHeaders(response: Response): string[] {
  if (typeof response.headers.getSetCookie === "function") {
    return response.headers.getSetCookie();
  }

  const raw = response.headers.get("set-cookie");
  return raw ? [raw] : [];
}

function parseSetCookieHeader(header: string): ParsedSetCookie | null {
  const segments = header.split(";").map((segment) => segment.trim());
  if (segments.length === 0) {
    return null;
  }

  const nameValue = segments[0];
  const separatorIndex = nameValue.indexOf("=");
  if (separatorIndex <= 0) {
    return null;
  }

  const parsed: ParsedSetCookie = {
    name: nameValue.slice(0, separatorIndex),
    value: nameValue.slice(separatorIndex + 1),
  };

  for (const attribute of segments.slice(1)) {
    const [rawKey, ...rawValueParts] = attribute.split("=");
    const key = rawKey.toLowerCase();
    const value = rawValueParts.join("=");

    switch (key) {
      case "path":
        parsed.path = value;
        break;
      case "max-age":
        parsed.maxAge = Number.parseInt(value, 10);
        break;
      case "httponly":
        parsed.httpOnly = true;
        break;
      case "secure":
        parsed.secure = true;
        break;
      case "samesite":
        parsed.sameSite = value.toLowerCase() as ParsedSetCookie["sameSite"];
        break;
      default:
        break;
    }
  }

  return parsed;
}

function shouldDeleteCookie(parsed: ParsedSetCookie): boolean {
  return parsed.maxAge === 0 || parsed.value === "";
}

/**
 * Forwards gateway Set-Cookie headers to the browser.
 * Only works in Server Actions and Route Handlers.
 */
export async function applyResponseCookies(response: Response): Promise<void> {
  const setCookieHeaders = getSetCookieHeaders(response);
  if (setCookieHeaders.length === 0) {
    return;
  }

  const cookieStore = await cookies();

  for (const header of setCookieHeaders) {
    const parsed = parseSetCookieHeader(header);
    if (!parsed) {
      continue;
    }

    const path = parsed.path ?? "/";

    if (shouldDeleteCookie(parsed)) {
      cookieStore.delete({
        name: parsed.name,
        path,
      });
      continue;
    }

    cookieStore.set(parsed.name, parsed.value, {
      httpOnly: parsed.httpOnly ?? false,
      path,
      maxAge: parsed.maxAge,
      sameSite: parsed.sameSite ?? "lax",
      secure: parsed.secure ?? false,
    });
  }
}
