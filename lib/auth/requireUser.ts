import "server-only";

import { redirect } from "next/navigation";
import { createServer } from "@/lib/supabase/server";

export async function requireUser() {
  const supabase = await createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return { supabase, user };
}

