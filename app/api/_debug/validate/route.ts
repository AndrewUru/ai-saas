import { NextResponse } from "next/server";
import { createAdmin } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key") || "";
  const supabase = createAdmin();
  const { data, error } = await supabase
    .from("agents")
    .select("id, api_key, is_active, allowed_domains")
    .eq("api_key", key)
    .maybeSingle();

  return NextResponse.json({
    ok: !!data,
    data,
    error: error ? { code: error.code, message: error.message } : null,
  });
}
