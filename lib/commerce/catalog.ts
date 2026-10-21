import { z } from "zod";

export const storeSchema = z.object({
  name: z.string().trim().min(1).max(100),
  currency: z.enum(["EUR", "USD", "GBP"]),
  published: z.boolean(),
});

// Parse decimal money without allowing rounding, exponent notation or fractions of a cent.
export function parsePrice(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  return cents > 0 && cents <= 100000000 ? cents : null;
}

export const productSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().trim().max(4000),
  category: z.string().trim().max(80),
  image_url: z.union([
    z.literal(""),
    z
      .string()
      .url()
      .max(2000)
      .refine((value) => new URL(value).protocol === "https:"),
  ]),
  price_cents: z.number().int().min(1).max(100000000),
  stock: z.number().int().min(0).max(1000000),
  active: z.boolean(),
});

export type NativeProduct = z.infer<typeof productSchema> & { id: string };
export type NativeStore = z.infer<typeof storeSchema> & { id: string };
export const PUBLIC_PRODUCT_FIELDS =
  "id, name, description, category, image_url, price_cents, stock";
