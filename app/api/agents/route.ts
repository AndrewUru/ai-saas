import { NextResponse } from "next/server";
import { agentListSchema } from "@/lib/contracts/agent";
import { createServer } from "@/lib/supabase/server";
import { getI18n } from "@/lib/i18n/server";

export async function GET() {
  const e = (await getI18n()).t.api;
  const supabase = await createServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: e.notAuthenticated }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("agents")
    .select("id, name, api_key, is_active, messages_limit")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: e.couldNotLoadAgents },
      { status: 500 }
    );
  }

  const parsed = agentListSchema.safeParse(data ?? []);
  if (!parsed.success) {
    return NextResponse.json({ error: e.invalidAgentData }, { status: 500 });
  }

  return NextResponse.json(parsed.data);
}
