import { clsx } from "./clsx";

export function cn(...inputs: (string | boolean | undefined | null | Record<string, boolean>)[]) {
  return clsx(...inputs);
}

export function formatPrice(amount: number, currency: string = "LKR"): string {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function generateOrderNumber(): string {
  const date = new Date();
  const prefix = "RA";
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${datePart}-${randomPart}`;
}

const TRACKING_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateTrackingNumber(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += TRACKING_CHARS[bytes[i] % TRACKING_CHARS.length];
  }
  return `RMX-${code.slice(0, 4)}-${code.slice(4)}`;
}

export function isValidTrackingFormat(value: string): boolean {
  return /^RMX-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(value);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function safeParseJSON<T>(value: string | null | undefined, fallback: T): T {
  if (!value || value === "undefined" || value === "null") return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function parseProductImages(images: string | null | undefined): string[] {
  return safeParseJSON<string[]>(images, []);
}
