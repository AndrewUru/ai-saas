type ProductListItem = {
  name?: unknown;
  price?: unknown;
  currency?: unknown;
  permalink?: unknown;
  stock_status?: unknown;
};

const OUT_OF_STOCK: Record<string, string> = {
  es: "sin stock",
  en: "out of stock",
  pt: "sem estoque",
  fr: "rupture de stock",
};

const TEXT_ONLY: Record<string, string> = {
  es: "Por ahora solo puedo leer mensajes de texto. ¿Me lo escribes?",
  en: "For now I can only read text messages. Could you type it?",
  pt: "Por enquanto só consigo ler mensagens de texto. Pode escrever?",
  fr: "Pour l'instant je ne lis que les messages texte. Pouvez-vous l'écrire ?",
};

const UNAVAILABLE: Record<string, string> = {
  es: "Ahora mismo no puedo responder. Inténtalo de nuevo más tarde.",
  en: "I can't reply right now. Please try again later.",
  pt: "Não consigo responder agora. Tente novamente mais tarde.",
  fr: "Je ne peux pas répondre pour le moment. Réessayez plus tard.",
};

const GREETING: Record<string, string> = {
  es: "¡Hola! ¿En qué puedo ayudarte?",
  en: "Hi! How can I help you?",
  pt: "Olá! Como posso ajudar?",
  fr: "Bonjour ! Comment puis-je vous aider ?",
};

function pick(map: Record<string, string>, language: string | null | undefined) {
  return map[language ?? ""] ?? map.en;
}

export function defaultGreeting(language: string | null | undefined) {
  return pick(GREETING, language);
}

export function textOnlyNotice(language: string | null | undefined) {
  return pick(TEXT_ONLY, language);
}

export function unavailableNotice(
  language: string | null | undefined,
  fallbackUrl?: string | null,
) {
  return [pick(UNAVAILABLE, language), fallbackUrl].filter(Boolean).join("\n");
}

function asText(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

/**
 * Las respuestas del agente pueden ser un JSON `product_list` pensado para las
 * tarjetas del widget. Las apps de mensajería solo reciben texto, así que se
 * convierte en una lista legible con enlaces.
 */
export function formatReplyAsText(reply: string, language?: string | null) {
  const trimmed = reply.trim();
  if (!trimmed.startsWith("{")) return trimmed;

  let parsed: { type?: unknown; title?: unknown; items?: unknown };
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return trimmed;
  }

  if (parsed.type !== "product_list" || !Array.isArray(parsed.items)) return trimmed;

  const lines = (parsed.items as ProductListItem[]).slice(0, 6).map((item, index) => {
    const name = asText(item.name) || "—";
    const price = [asText(item.price), asText(item.currency)].filter(Boolean).join(" ");
    const outOfStock = asText(item.stock_status) === "outofstock";
    const details = [price, outOfStock ? pick(OUT_OF_STOCK, language) : ""]
      .filter(Boolean)
      .join(" · ");
    const link = asText(item.permalink);

    return [`${index + 1}. ${name}${details ? ` — ${details}` : ""}`, link ? `   ${link}` : ""]
      .filter(Boolean)
      .join("\n");
  });

  const title = asText(parsed.title);
  return [title, ...lines].filter(Boolean).join("\n\n");
}

/** Divide un texto largo respetando saltos de línea cuando es posible. */
export function splitMessage(text: string, maxLength: number) {
  const chunks: string[] = [];
  let rest = text;

  while (rest.length > maxLength) {
    const cut = rest.lastIndexOf("\n", maxLength);
    const index = cut > maxLength / 2 ? cut : maxLength;
    chunks.push(rest.slice(0, index).trimEnd());
    rest = rest.slice(index).trimStart();
  }

  if (rest) chunks.push(rest);
  return chunks;
}
