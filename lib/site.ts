// lib/site.ts
import { headers } from "next/headers";
import type { ReadonlyHeaders } from "next/headers";
import { getCurrentHost } from "@/lib/get-current-host";

export async function getSiteUrl() {
  const headersList = await headers();
  return getSiteUrlFromHeaders(headersList);
}

export function getSiteUrlFromHeaders(headersList: ReadonlyHeaders) {
  const host = getCurrentHost(headersList);

  const normalizedHost = host.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const isLocal =
    normalizedHost.includes("localhost") ||
    normalizedHost.startsWith("127.0.0.1");

  const protocol = isLocal ? "http" : "https";

  return `${protocol}://${normalizedHost}`;
}
