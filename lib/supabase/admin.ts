import { createClient } from "@supabase/supabase-js";

export function createAdmin() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only
  return createClient(url, key, { auth: { persistSession: false } });
}
