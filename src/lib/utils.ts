import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown, message = "An error occurred."): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return message;
}
