import { z } from "zod";

export const productVariantSchema = z.object({
  name: z.string().min(1).max(100),
  value: z.string().min(1).max(100),
  price: z.union([z.number().nonnegative(), z.string()]).optional(),
  stock: z.union([z.number().int().nonnegative(), z.string()]).optional(),
  sku: z.string().max(100).nullable().optional(),
});

export const productCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).nullable().optional(),
  price: z.union([z.number().nonnegative(), z.string()]),
  salePrice: z.union([z.number().nonnegative(), z.string()]).nullable().optional(),
  sku: z.string().max(100).nullable().optional(),
  barcode: z.string().max(100).nullable().optional(),
  stock: z.union([z.number().int().nonnegative(), z.string()]).optional(),
  lowStockThreshold: z.union([z.number().int().nonnegative(), z.string()]).optional(),
  images: z.array(z.string().max(2000)).optional(),
  status: z.enum(["active", "draft", "archived"]).optional(),
  isFeatured: z.boolean().optional(),
  categoryId: z.string().max(100).nullable().optional(),
  variants: z.array(productVariantSchema).optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  image: z.string().max(2000).nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "input"}: ${issue.message}`)
    .join("; ");
}

export function toNumber(value: string | number): number {
  return typeof value === "number" ? value : parseFloat(value);
}

export function toInt(value: string | number | undefined, fallback = 0): number {
  if (value === undefined || value === null || value === "") return fallback;
  const n = typeof value === "number" ? Math.trunc(value) : parseInt(value);
  return isNaN(n) ? fallback : n;
}
