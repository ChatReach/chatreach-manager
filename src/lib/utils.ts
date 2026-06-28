import { clsx, type ClassValue } from "clsx"
import { format } from "date-fns"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to Dutch date notation: d-m-Y (e.g. 04-03-2026).
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";

  return format(new Date(date), "dd-MM-yyyy");
}

/**
 * Format a date to Dutch date and time notation: d-m-Y H:i (e.g. 04-03-2026 13:17).
 */
export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "";

  return format(new Date(date), "dd-MM-yyyy HH:mm");
}
