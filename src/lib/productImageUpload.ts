"use client";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type ImageValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export function validateImageFile(file: File): ImageValidationResult {
  const type = (file.type || "").toLowerCase().trim();
  if (!type || !ALLOWED.has(type)) {
    return {
      ok: false,
      message: "Only JPEG, PNG, WebP, and GIF images are allowed.",
    };
  }
  if (!file.size || file.size > MAX_BYTES) {
    return { ok: false, message: "Each image must be 10MB or smaller." };
  }
  return { ok: true };
}

/** Backend presign uses a strict filename pattern; keep client-side name safe. */
export function toSafeUploadFileName(original: string): string {
  const base = original.replace(/\\/g, "/").split("/").pop() || "image";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  return cleaned.length > 0 ? cleaned : "image.jpg";
}

export interface PresignedUploadPayload {
  uploadUrl: string;
  httpMethod: string;
  headers?: Record<string, string> | null;
  contentType: string;
}

/**
 * Uploads binary data to R2 (or dev placeholder URL) using the presigned request.
 * Uses anonymous fetch — do not send session cookies to third-party origins.
 */
export async function putFileToPresignedUrl(
  presign: PresignedUploadPayload,
  body: Blob
): Promise<void> {
  const headers = new Headers();
  const merged = presign.headers ?? {};
  for (const [k, v] of Object.entries(merged)) {
    if (v != null && v !== "") {
      headers.set(k, v);
    }
  }
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", presign.contentType);
  }

  const method = (presign.httpMethod || "PUT").toUpperCase();
  const res = await fetch(presign.uploadUrl, {
    method,
    headers,
    body,
    mode: "cors",
    credentials: "omit",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      text
        ? `Upload failed (${res.status}): ${text.slice(0, 200)}`
        : `Upload failed with status ${res.status}`
    );
  }
}

/**
 * Downscales large images on the longest edge to reduce storage and upload time.
 */
export async function resizeImageIfNeeded(
  file: File,
  maxLongEdge = 1600,
  quality = 0.85
): Promise<File> {
  const type = (file.type || "").toLowerCase();
  if (!type.startsWith("image/") || type === "image/gif") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    const long = Math.max(width, height);
    if (long <= maxLongEdge) {
      bitmap.close();
      return file;
    }
    const scale = maxLongEdge / long;
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();

    const mime = type === "image/png" ? "image/png" : "image/jpeg";
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Could not encode image"))),
        mime,
        quality
      );
    });

    const ext = mime === "image/png" ? "png" : "jpg";
    const name = toSafeUploadFileName(
      file.name.replace(/\.[^.]+$/, "") + "." + ext
    );
    return new File([blob], name, { type: mime });
  } catch {
    return file;
  }
}

/**
 * Maps items to results with at most `concurrency` mappers running at once.
 * Output indices match input order.
 */
export async function mapConcurrent<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const n = items.length;
  if (n === 0) return [];
  const results: R[] = new Array(n);
  let nextIndex = 0;
  const limit = Math.min(Math.max(1, concurrency), n);
  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= n) break;
      results[i] = await mapper(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

/**
 * Runs async work per item with a concurrency limit; collects per-index
 * fulfilled/rejected outcomes (like Promise.allSettled, order preserved).
 */
export async function forEachConcurrent<T>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<void>
): Promise<PromiseSettledResult<void>[]> {
  const n = items.length;
  if (n === 0) return [];
  const outcomes: PromiseSettledResult<void>[] = new Array(n);
  let nextIndex = 0;
  const limit = Math.min(Math.max(1, concurrency), n);
  async function worker() {
    while (true) {
      const i = nextIndex++;
      if (i >= n) break;
      try {
        await fn(items[i], i);
        outcomes[i] = { status: "fulfilled", value: undefined };
      } catch (reason) {
        outcomes[i] = { status: "rejected", reason };
      }
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return outcomes;
}
