"use client";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const supabase = createClient();
  return (
    <button
      className="rounded bg-gray-200 px-3 py-1 text-sm"
      onClick={async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
      }}
    >
      Cerrar sesión
    </button>
  );
}
