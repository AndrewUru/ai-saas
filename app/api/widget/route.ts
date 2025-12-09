import { NextResponse } from "next/server";
import { loadAgentByKey } from "@/lib/widget/loadAgent";
import {
  resolveHost,
  ensureDomainAllowed,
} from "@/lib/widget/requestContext";
import { buildAppearance, buildConfig } from "@/lib/widget/appearance";
import { renderStyles } from "@/lib/widget/styles";
import { renderWidgetScript } from "@/lib/widget/clientScript";

type StatusError = Error & { status?: number };

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new NextResponse("// Missing key", {
      headers: { "Content-Type": "application/javascript" },
      status: 400,
    });
  }

  try {
    const agent = await loadAgentByKey(key);
    const isPreview = url.searchParams.get("preview") === "1";
    const { host, isSameSite, siteHost } = resolveHost(req, isPreview);
    ensureDomainAllowed(agent, host, isPreview, isSameSite, siteHost);

    const appearance = buildAppearance(agent, url.searchParams);
    const config = buildConfig(key, `${url.origin}/api/agent/chat`, appearance);
    const js = renderWidgetScript(config, renderStyles(appearance));

    return new NextResponse(js, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: unknown) {
    const typedError = err as StatusError;
    const message =
      typedError && typedError.message ? typedError.message : "Server error";
    const status =
      typeof typedError?.status === "number"
        ? typedError.status
        : message === "Agent not found"
        ? 404
        : message === "Inactive agent"
        ? 403
        : message === "Domain not allowed"
        ? 403
        : 500;

    return new NextResponse(`// ${message}`, {
      headers: { "Content-Type": "application/javascript" },
      status,
    });
  }
}
