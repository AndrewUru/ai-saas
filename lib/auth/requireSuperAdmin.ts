import "server-only";

import type { User } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/requireUser";

function getSuperAdminEmails() {
  return (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperAdmin(user: User | null | undefined) {
  if (!user?.email || !user.email_confirmed_at) return false;
  return getSuperAdminEmails().includes(user.email.toLowerCase());
}

export async function requireSuperAdmin() {
  const { supabase, user } = await requireUser();

  // 404 instead of 403 so the route does not reveal that it exists.
  if (!isSuperAdmin(user)) notFound();

  return { supabase, user };
}
