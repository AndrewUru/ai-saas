import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";
import { getRequestLocale } from "@/lib/i18n/server";
import { getMessages } from "@/lib/i18n/messages";

export async function GET(req: Request) {
  const e = getMessages(getRequestLocale(req)).api;
  const key = new URL(req.url).searchParams.get("key")?.trim() ?? "";

  if (!key)
    return NextResponse.json({
      ok: false,
      data: null,
      error: { code: "missing_key", message: e.missingKey },
    });

  const supabase = createAdmin();
  const { data, error } = await supabase
    .from("agents")
    .select("id, api_key, is_active, allowed_domains")
    .eq("api_key", key)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        data: null,
        error: { code: error.code, message: error.message },
      },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({
      ok: false,
      data: null,
      error: { code: "not_found", message: e.agentNotFound },
    });
  }

  return NextResponse.json({
    ok: true,
    data,
    error: null,
  });
}
