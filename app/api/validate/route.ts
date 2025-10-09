import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key")?.trim() ?? "";

  if (!key) {
    return NextResponse.json(
      {
        ok: false,
        data: null,
        error: { code: "missing_key", message: "Falta key" },
      },
      { status: 400 }
    );
  }

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
    return NextResponse.json(
      {
        ok: false,
        data: null,
        error: { code: "not_found", message: "Agente no encontrado" },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    ok: true,
    data,
    error: null,
  });
}
