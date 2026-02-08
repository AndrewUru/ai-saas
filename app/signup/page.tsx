// app/signup/page.tsx
"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

type Status = {
  intent: "info" | "success" | "error";
  message: string;
} | null;

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

  // --- Email + password ----------------------------------------------------
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
        // Email confirmation disabled
        setStatus({
          intent: "success",
          message: "Account created. Redirecting to your dashboard...",
        });
        router.push("/dashboard");
      } else {
        // Email confirmation enabled
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

  // --- Google OAuth --------------------------------------------------------
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

  // --- Magic link (passwordless) -------------------------------------------
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
    <main
      className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100"
      data-oid="gp70muo"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.20),transparent_55%)]"
        data-oid="9z0-ca2"
      />

      <div
        className="relative mx-auto flex min-h-screen max-w-6xl flex-col-reverse items-center gap-12 px-6 py-16 md:flex-row md:items-stretch md:gap-16 md:px-10 lg:px-16"
        data-oid="20suqca"
      >
        {/* LEFT COLUMN */}
        <section
          className="flex flex-1 flex-col justify-center space-y-6 text-center md:text-left"
          data-oid="w.qtwk_"
        >
          <p
            className="inline-flex items-center gap-2 self-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300 md:self-start"
            data-oid="ex1vev4"
          >
            Create your workspace
          </p>
          <h1
            className="text-3xl font-semibold leading-tight sm:text-4xl"
            data-oid="75:z1.7"
          >
            Create your account to manage all your AI agents
          </h1>
          <p className="text-base text-slate-300 sm:text-lg" data-oid="1z-t.ld">
            Sign up with email, passwordless magic link, or Google and
            orchestrate every store and agent from a single dashboard.
          </p>
        </section>

        {/* SIGNUP CARD */}
        <section
          className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur"
          data-oid="61bj8q_"
        >
          <div className="mb-6 space-y-2 text-center" data-oid="qufgjne">
            <h2
              className="text-2xl font-semibold text-white"
              data-oid="8.yt-6x"
            >
              Create account
            </h2>
            <p className="text-sm text-slate-400" data-oid="wf84y2u">
              Use your work email to get started.
            </p>
          </div>

          {/* Email + password form */}
          <form
            onSubmit={handleSignup}
            className="space-y-4"
            data-oid="f-szciu"
          >
            <div className="space-y-2" data-oid="84yx_p7">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-200"
                data-oid="u1tz__o"
              >
                Work email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@store.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                data-oid="uqle6c2"
              />
            </div>

            <div className="space-y-2" data-oid="67zwne_">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-200"
                data-oid="aop20_s"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                data-oid="zf:a0j5"
              />
            </div>

            <div className="space-y-2" data-oid="_ps02cz">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium text-slate-200"
                data-oid="cfxdt20"
              >
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
                data-oid="6nnsnq9"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
              data-oid="ty5l6ac"
            >
              {isSubmitting ? "Creating your account..." : "Create account"}
            </button>
          </form>

          {/* Divider */}
          <div
            className="my-6 flex items-center gap-4 text-xs text-slate-500"
            data-oid="1hwuphu"
          >
            <span className="h-px flex-1 bg-slate-800" data-oid="mignu2v" />
            Or sign up with
            <span className="h-px flex-1 bg-slate-800" data-oid="l4:-66u" />
          </div>

          {/* Google */}
          <button
            onClick={signUpWithGoogle}
            className="w-full mb-3 flex items-center justify-center gap-3 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white font-medium hover:bg-white/20 transition"
            data-oid="l3qix:8"
          >
            <Image
              src="/google.svg"
              alt="Google"
              width={20}
              height={20}
              className="h-5 w-5"
              data-oid="-_3wx8g"
            />
            Continue with Google
          </button>
          <button
            type="button"
            onClick={sendMagicLink}
            disabled={isSubmitting}
            className="w-full rounded-full border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition disabled:cursor-not-allowed disabled:opacity-70"
            data-oid="j2mdn2y"
          >
            {isSubmitting ? "Sending magic link..." : "Send me a magic link"}
          </button>

          <p
            className="mt-6 text-center text-xs text-slate-500"
            data-oid="6u.8whm"
          >
            Already have an account?{" "}
            <a
              href="/login"
              className="text-emerald-300 hover:text-emerald-200"
              data-oid="98.ggim"
            >
              Sign in
            </a>
          </p>

          {status && (
            <p
              className={[
                "mt-6 rounded-2xl border px-4 py-3 text-sm",
                status.intent === "success" &&
                  "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
                status.intent === "error" &&
                  "border-rose-500/40 bg-rose-500/10 text-rose-200",
                status.intent === "info" &&
                  "border-slate-700 bg-slate-900/70 text-slate-200",
              ]
                .filter(Boolean)
                .join(" ")}
              role="status"
              aria-live="polite"
              data-oid="ai8858u"
            >
              {status.message}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
