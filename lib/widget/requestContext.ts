import {
  ensureDomainAllowed,
  resolveRequestHost,
} from "@/lib/security/domains";
import type { AgentRecord } from "./types";

export function resolveHost(req: Request, isPreview: boolean) {
  return resolveRequestHost(req, { allowSameSiteFallback: isPreview });
}

export function ensureWidgetDomainAllowed(
  agent: AgentRecord,
  host: string | null,
  isPreview: boolean,
  isSameSite: boolean,
  siteHost: string | null
) {
  ensureDomainAllowed(
    agent,
    { host, isSameSite, siteHost },
    { allowDashboardPreview: isPreview },
  );
}
