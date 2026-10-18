export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "locale";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

// Formato regional para fechas y números
export const intlLocales: Record<Locale, string> = {
  en: "en-US",
  es: "es-ES",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/**
 * Elige el primer idioma soportado de un header Accept-Language,
 * respetando los pesos q=.
 */
export function matchAcceptLanguage(header: string | null | undefined): Locale | null {
  if (!header) return null;

  const candidates = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;
      return { lang: tag.toLowerCase().split("-")[0], q: Number.isFinite(q) ? q : 0 };
    })
    .filter((c) => c.lang && c.q > 0)
    .sort((a, b) => b.q - a.q);

  for (const { lang } of candidates) {
    if (isLocale(lang)) return lang;
  }
  return null;
}

/** Sustituye {variables} en un mensaje. */
export function format(
  message: string,
  values: Record<string, string | number> = {},
): string {
  return message.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
