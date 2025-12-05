import { NextResponse } from "next/server";
import { agentListSchema } from "@/lib/contracts/agent";
import { createServer } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServer();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("agents")
    .select("id, name, api_key, is_active, messages_limit")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: "Could not load agents" },
      { status: 500 }
    );
  }

  const parsed = agentListSchema.safeParse(data ?? []);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid agent data" }, { status: 500 });
  }

  return NextResponse.json(parsed.data);
}
