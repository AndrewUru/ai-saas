import "server-only";

import { redirect } from "next/navigation";
import { createServer } from "@/lib/supabase/server";

type PaidProfile = {
  is_paid: boolean | null;
};

export async function requirePaidUser() {
  const supabase = await createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_paid")
    .eq("id", user.id)
    .single<PaidProfile>();

  if (error || profile?.is_paid !== true) redirect("/pricing");

  return { supabase, user, profile };
}
