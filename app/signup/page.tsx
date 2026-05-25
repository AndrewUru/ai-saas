// app/signup/page.tsx
"use client";

export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status = {
  intent: "info" | "success" | "error";
  message: string;
} | null;

const inputClassName =
  "w-full rounded-lg border border-white/10 bg-white/[0.03] px-3.5 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition hover:border-white/15 focus:border-accent/70 focus:ring-2 focus:ring-accent/20";

const labelClassName = "text-sm font-medium text-zinc-300";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [redirectUrl, setRedirectUrl] = useState("");

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    setRedirectUrl(`${base}/auth/callback?next=/dashboard`);
  }, []);

  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setStatus({
        intent: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    if (!redirectUrl) return;

    setIsSubmitting(true);
    setStatus({ intent: "info", message: "Creating your account..." });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setStatus({ intent: "error", message: error.message });
        return;
      }

      if (data.session) {
        setStatus({
          intent: "success",
          message: "Account created. Redirecting to your dashboard...",
        });
        router.push("/dashboard");
      } else {
        setStatus({
          intent: "success",
          message:
            "Account created. Check your inbox to confirm your email before signing in.",
        });
      }
    } catch (error) {
      setStatus({
        intent: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error while creating your account.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const signUpWithGoogle = async () => {
    if (!redirectUrl) return;

    setStatus({ intent: "info", message: "Redirecting to Google..." });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });

    if (error) {
      setStatus({ intent: "error", message: error.message });
    }
  };

  const sendMagicLink = async () => {
    if (!email) {
      setStatus({
        intent: "error",
        message: "Please enter your email first.",
      });
      return;
    }

    if (!redirectUrl) return;

    setIsSubmitting(true);
    setStatus({
      intent: "info",
      message: "Sending your magic link...",
    });

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setStatus({ intent: "error", message: error.message });
        return;
      }

      setStatus({
        intent: "success",
        message:
          "Check your inbox to finish creating your account with a magic link.",
      });
    } catch (error) {
      setStatus({
        intent: "error",
        message: error instanceof Error ? error.message : "Unexpected error.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-[calc(100svh-64px)] overflow-hidden bg-[#030303] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="relative mx-auto flex min-h-[calc(100svh-64px)] w-full max-w-md items-center px-6 py-16">
        <section className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8">
          <div className="mb-8 text-center">
            <Link
              href="/"
              className="mb-8 inline-flex items-center justify-center"
              aria-label="AICommerce home"
            >
              <Image
                src="/logo.svg"
                alt="AICommerce"
                width={132}
                height={36}
                className="object-contain"
                priority
              />
            </Link>

            <h1 className="text-2xl font-semibold tracking-tight">
              Create account
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Start managing your commerce agents.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className={labelClassName}>
                Work email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@store.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className={labelClassName}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="********"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClassName}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className={labelClassName}>
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="********"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={inputClassName}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-black transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-xs text-zinc-600">
            <span className="h-px flex-1 bg-white/10" />
            Or sign up with
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={signUpWithGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <Image
                src="/google.svg"
                alt=""
                width={20}
                height={20}
                className="h-5 w-5"
                aria-hidden="true"
              />
              Continue with Google
            </button>

            <button
              type="button"
              onClick={sendMagicLink}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-white/10 bg-transparent px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending magic link..." : "Send magic link"}
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-accent hover:text-accent-strong"
            >
              Sign in
            </Link>
          </p>

          {status && (
            <p
              className={[
                "mt-6 rounded-lg border px-4 py-3 text-sm",
                status.intent === "success" &&
                  "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
                status.intent === "error" &&
                  "border-rose-500/40 bg-rose-500/10 text-rose-200",
                status.intent === "info" &&
                  "border-white/10 bg-white/[0.04] text-zinc-200",
              ]
                .filter(Boolean)
                .join(" ")}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
