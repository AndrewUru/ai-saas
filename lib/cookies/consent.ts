export type ConsentState = {
  necessary: true; // siempre true
  analytics: boolean;
  marketing: boolean;
  updatedAt: number;
};

export const CONSENT_COOKIE_NAME = "cookie_consent";
export const CONSENT_VERSION = 1;

export const defaultConsent: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  updatedAt: Date.now(),
};

export function safeParseConsent(raw: string | null): ConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentState & { v?: number }>;
    // Validación mínima
    if (typeof parsed.analytics !== "boolean") return null;
    if (typeof parsed.marketing !== "boolean") return null;
    if (typeof parsed.updatedAt !== "number") return null;
    return {
      necessary: true,
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return null;
  }
}

export function serializeConsent(consent: ConsentState) {
  // guardamos también versión por si cambias el modelo en el futuro
  return JSON.stringify({ ...consent, v: CONSENT_VERSION });
}

export function getConsentFromBrowser(): ConsentState | null {
  if (typeof window === "undefined") return null;

  // 1) localStorage
  const ls = window.localStorage.getItem(CONSENT_COOKIE_NAME);
  const fromLs = safeParseConsent(ls);
  if (fromLs) return fromLs;

  // 2) cookie
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));

  const cookieVal = match
    ? decodeURIComponent(match.split("=")[1] || "")
    : null;
  return safeParseConsent(cookieVal);
}

export function setConsentInBrowser(consent: ConsentState) {
  if (typeof window === "undefined") return;

  const value = serializeConsent(consent);

  // localStorage
  window.localStorage.setItem(CONSENT_COOKIE_NAME, value);

  // cookie (180 días)
  const maxAge = 60 * 60 * 24 * 180;
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

/**
 * Dispara un evento global para que otros módulos (analytics, scripts)
 * reaccionen cuando el usuario actualice consentimiento.
 */
export function emitConsentUpdated(consent: ConsentState) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("consent:updated", { detail: consent }));
}
