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

  const safelyMutateCookie = (mutate: () => void, label: "set" | "remove") => {
    try {
      mutate();
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Cookies can only be modified in a Server Action or Route Handler")
      ) {
        console.warn(
          `Skipping Supabase cookie ${label}: ${error.message}`,
        );
        return;
      }
      throw error;
    }
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          safelyMutateCookie(
            () => cookieStore.set(name, value, withDefaultPath(options)),
            "set",
          );
        },
        remove(name: string, options?: CookieOptions) {
          safelyMutateCookie(
            () =>
              cookieStore.set(name, "", {
                ...withDefaultPath(options),
                maxAge: 0,
              }),
            "remove",
          );
        },
      },
    }
  );
};
