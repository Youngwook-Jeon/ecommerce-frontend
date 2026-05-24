/**
 * Public product API failure with HTTP status (for mapping to Next.js notFound / error UI).
 */
export class PublicProductApiError extends Error {
  readonly status: number;
  readonly body?: string;

  constructor(message: string, status: number, body?: string) {
    super(message);
    this.name = "PublicProductApiError";
    this.status = status;
    this.body = body;
  }
}

export function isPublicProductApiError(
  error: unknown
): error is PublicProductApiError {
  return error instanceof PublicProductApiError;
}
