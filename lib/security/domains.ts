import { getSiteHostFromHeaders } from "@/lib/site";

type StatusError = Error & { status: number };

export type DomainRestrictedAgent = {
  allowed_domains: string[] | null;
};

export type RequestHostContext = {
  host: string | null;
  isSameSite: boolean;
  siteHost: string | null;
};

function makeStatusError(message: string, status: number): StatusError {
  const err = new Error(message) as StatusError;
  err.status = status;
  return err;
}

export function normalizeHost(value: string | null) {
  if (!value) return null;

  try {
    return new URL(value).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

export function resolveRequestHost(
  req: Request,
  options?: { allowSameSiteFallback?: boolean },
): RequestHostContext {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const fetchSite = req.headers.get("sec-fetch-site");
  const siteHost = getSiteHostFromHeaders(req.headers) || null;

  const isSameSite =
    fetchSite === null ||
    fetchSite === "same-site" ||
    fetchSite === "same-origin";

  const host =
    normalizeHost(origin) ||
    normalizeHost(referer) ||
    (options?.allowSameSiteFallback && isSameSite ? siteHost : null);

  return { host, isSameSite, siteHost };
}

export function ensureDomainAllowed(
  agent: DomainRestrictedAgent,
  context: RequestHostContext,
  options?: { allowDashboardPreview?: boolean },
) {
  const allowed =
    Array.isArray(agent.allowed_domains) && agent.allowed_domains.length > 0
      ? agent.allowed_domains.map((domain) => domain.toLowerCase())
      : [];

  if (allowed.length === 0) return;

  const host = context.host;
  const isDashboardHost =
    typeof host === "string" &&
    (host.includes("localhost") ||
      host.includes("dashboard") ||
      (context.siteHost && host === context.siteHost));

  if (
    options?.allowDashboardPreview &&
    context.isSameSite &&
    isDashboardHost
  ) {
    return;
  }

  if (!host || !allowed.includes(host)) {
    throw makeStatusError("Domain not allowed", 403);
  }
}
