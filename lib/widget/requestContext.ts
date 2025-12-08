import { getSiteHost, getSiteUrl } from "@/lib/site";
import type { AgentRecord } from "./types";

type StatusError = Error & { status: number };

const SITE_URL = getSiteUrl();
const SITE_HOST = getSiteHost(SITE_URL);

function hostFrom(h: string | null) {
  if (!h) return null;
  try {
    return new URL(h).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function makeStatusError(message: string, status: number): StatusError {
  const err = new Error(message) as StatusError;
  err.status = status;
  return err;
}

export function resolveHost(req: Request, isPreview: boolean) {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const fetchSite = req.headers.get("sec-fetch-site");

  const isSameSite =
    fetchSite === null ||
    fetchSite === "same-site" ||
    fetchSite === "same-origin";

  const host =
    hostFrom(origin) ||
    hostFrom(referer) ||
    (isPreview && isSameSite ? SITE_HOST : null);

  return { host, isSameSite };
}

export function ensureDomainAllowed(
  agent: AgentRecord,
  host: string | null,
  isPreview: boolean,
  isSameSite: boolean
) {
  const allowed =
    Array.isArray(agent.allowed_domains) && agent.allowed_domains.length > 0
      ? agent.allowed_domains.map((d) => d.toLowerCase())
      : [];

  if (allowed.length === 0) return;

  const isDashboardHost =
    typeof host === "string" &&
    (host.includes("localhost") ||
      host.includes("dashboard") ||
      (SITE_HOST && host === SITE_HOST));

  const isDashboardPreview = isPreview && isDashboardHost && isSameSite;

  if (isDashboardPreview) return;

  if (!host || !allowed.includes(host)) {
    throw makeStatusError("Domain not allowed", 403);
  }
}
