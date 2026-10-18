import { cookies, headers } from "next/headers";

import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  matchAcceptLanguage,
  type Locale,
} from "./config";
import { getMessages, type Messages } from "./messages";

/**
 * Idioma de la petición actual: cookie del selector, luego Accept-Language,
 * luego el idioma por defecto. Funciona en Server Components, Server Actions
 * y Route Handlers.
 */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(fromCookie)) return fromCookie;

  const headerStore = await headers();
  return matchAcceptLanguage(headerStore.get("accept-language")) ?? defaultLocale;
}

export async function getI18n(): Promise<{ locale: Locale; t: Messages }> {
  const locale = await getLocale();
  return { locale, t: getMessages(locale) };
}

/**
 * Para rutas API que reciben el Request directamente (p. ej. llamadas
 * desde el widget en otro dominio, donde no hay cookie del sitio).
 */
export function getRequestLocale(request: Request): Locale {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${LOCALE_COOKIE}=`));
  const fromCookie = match?.slice(LOCALE_COOKIE.length + 1);
  if (isLocale(fromCookie)) return fromCookie;

  return matchAcceptLanguage(request.headers.get("accept-language")) ?? defaultLocale;
}
