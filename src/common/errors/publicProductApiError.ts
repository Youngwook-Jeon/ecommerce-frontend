/**
 * Public product API failure with HTTP status (for mapping to Next.js notFound / error UI).
 */
export class PublicProductApiError extends Error {
  readonly status: number;
  readonly body?: string;
  readonly code?: string;

  constructor(message: string, status: number, body?: string) {
    super(message);
    this.name = "PublicProductApiError";
    this.status = status;
    this.body = body;
    if (body) {
      try {
        const parsed: unknown = JSON.parse(body);
        if (typeof parsed === "object" && parsed !== null && "code" in parsed && typeof parsed.code === "string") {
          this.code = parsed.code;
        }
      } catch {
        // Non-JSON failures still retain their HTTP status.
      }
    }
  }
}

export function isPublicProductApiError(
  error: unknown
): error is PublicProductApiError {
  return error instanceof PublicProductApiError;
}
