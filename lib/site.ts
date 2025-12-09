import { getCurrentHost } from "@/lib/get-current-host";

export function getSiteUrl() {
  const host = getCurrentHost();
  const normalizedHost = host
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  return `https://${normalizedHost}`;
}

export function getSiteHost(url: string) {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return "";
  }
}
