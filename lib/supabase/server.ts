// lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para Server Components / Rutas
 * - Adaptado a los tipos que espera @supabase/ssr
 */
export const createServer = async () => {
  const cookieStore = await cookies();

  const withDefaultPath = (options?: CookieOptions) => ({
    ...(options ?? {}),
    path: "/",
  });

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          cookieStore.set(name, value, withDefaultPath(options));
        },
        remove(name: string, options?: CookieOptions) {
          cookieStore.set(name, "", {
            ...withDefaultPath(options),
            maxAge: 0,
          });
        },
      },
    }
  );
};
