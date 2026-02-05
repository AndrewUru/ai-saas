// lib/site.ts
import { headers } from "next/headers";
import { getCurrentHost, type HeaderGetter } from "@/lib/get-current-host";

export async function getSiteUrl() {
  const headersList = await headers();
  return getSiteUrlFromHeaders(headersList);
}

export async function getSiteHost() {
  const headersList = await headers();
  return getSiteHostFromHeaders(headersList);
}

export function getSiteUrlFromHeaders(headersList: HeaderGetter) {
  const host = getCurrentHost(headersList);

  const normalizedHost = host.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const isLocal =
    normalizedHost.includes("localhost") ||
    normalizedHost.startsWith("127.0.0.1");

  const protocol = isLocal ? "http" : "https";

  return `${protocol}://${normalizedHost}`;
}

export function getSiteHostFromHeaders(headersList: HeaderGetter) {
  const host = getCurrentHost(headersList);
  return normalizeHost(host);
}

function normalizeHost(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const hasScheme = /^https?:\/\//i.test(trimmed);
  try {
    const url = new URL(hasScheme ? trimmed : `https://${trimmed}`);
    return url.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return trimmed
      .replace(/^https?:\/\//i, "")
      .replace(/\/$/, "")
      .replace(/^www\./, "")
      .toLowerCase();
  }
}
