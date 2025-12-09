const VERCEL_DEPLOY_URL = "https://ai-saas-nine-omega.vercel.app/";
const LOCAL_FALLBACK = "http://localhost:3000";

export function getSiteUrl() {
  if (process.env.NODE_ENV === "development") {
    return LOCAL_FALLBACK;
  }

  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const normalized = vercel.startsWith("http") ? vercel : `https://${vercel}`;
    return normalized.replace(/\/$/, "");
  }

  return (VERCEL_DEPLOY_URL || LOCAL_FALLBACK).replace(/\/$/, "");
}

export function getSiteHost(url: string) {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return "";
  }
}
