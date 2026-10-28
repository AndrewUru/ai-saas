import { z } from "zod";

export const cartContextSchema = z.object({
  store_id: z.string().uuid(),
  currency: z.enum(["EUR", "USD", "GBP"]),
  revision: z.number().int().min(0).max(Number.MAX_SAFE_INTEGER),
  items: z.array(z.object({ id: z.string().uuid(), quantity: z.number().int().min(1).max(99) })).max(500)
    .refine(items => new Set(items.map(item => item.id)).size === items.length),
  focused_product_id: z.string().uuid().nullable(),
  suggested_product_ids: z.array(z.string().uuid()).max(8),
});
const visitorMessageSchema = z.object({ role: z.enum(["user", "assistant"]), content: z.string() });
// Widget history is optional context: malformed or oversized entries are dropped, never rejected.
export const visitorMessagesSchema = z.array(z.unknown()).catch([]).transform(messages => messages.slice(-20).flatMap(entry => {
  const message = visitorMessageSchema.safeParse(entry);
  return message.success ? [{ role: message.data.role, content: message.data.content.slice(0, 2000) }] : [];
}));

export const cartChangeSchema = z.object({
  operation: z.enum(["add", "set", "remove"]),
  product_query: z.string().trim().max(160),
  quantity: z.number().int().min(0).max(99),
});
export type CartContext = z.infer<typeof cartContextSchema>;
export type CartChange = z.infer<typeof cartChangeSchema>;
export type CartProduct = { id: string; name: string; description: string; category: string; image_url: string; price_cents: number; stock: number; active: boolean };
export type CartAction = {
  id: string; store_id: string; currency: string; expected_revision: number;
  product: CartProduct; before_quantity: number; after_quantity: number;
};

export function resolveCartQuantity(change: CartChange, before: number, stock: number) {
  if (change.operation === "remove") return before > 0 ? 0 : null;
  if (change.operation === "add" && change.quantity === 0) return null;
  const after = change.operation === "add" ? before + change.quantity : change.quantity;
  return after >= 0 && after <= Math.min(stock, 99) ? after : null;
}

// Ambiguous references must never pick an arbitrary recommendation.
export function contextualProductIds(context: CartContext, operation: CartChange["operation"]) {
  if (context.focused_product_id) return [context.focused_product_id];
  if (operation !== "add") return context.items.map(item => item.id);
  if (context.suggested_product_ids.length) return [...new Set(context.suggested_product_ids)];
  return context.items.map(item => item.id);
}
