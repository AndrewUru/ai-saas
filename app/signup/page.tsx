"use client";

import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail, WandSparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  AuthDivider,
  AuthStatus,
  type AuthStatusValue,
  GoogleAuthButton,
  authInputClassName,
  authPrimaryButtonClassName,
} from "@/components/auth/AuthControls";
import AuthExperience from "@/components/auth/AuthExperience";
import { useI18n } from "@/lib/i18n/client";
import { createClient } from "@/lib/supabase/client";

type PendingAction = "password" | "magic" | "google" | null;

function getCallbackUrl() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
  return `${origin}/auth/callback?next=/dashboard`;
}
export default function SignupPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<PendingAction>(null);
  const [status, setStatus] = useState<AuthStatusValue>(null);
  const isBusy = pending !== null;
  const { t } = useI18n();
  const a = t.auth;
  const s = a.signup;

  async function createAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending("password");
    setStatus({ intent: "info", message: s.creating });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: getCallbackUrl() },
      });

      if (error) {
        setStatus({ intent: "error", message: error.message });
        return;
      }

      if (data.session) {
        setStatus({ intent: "success", message: s.ready });
        router.replace("/dashboard");
        router.refresh();
        return;
      }

      setStatus({
        intent: "success",
        message: s.confirmEmail,
      });
    } catch (error) {
      setStatus({
        intent: "error",
        message: error instanceof Error ? error.message : s.error,
      });
    } finally {
      setPending(null);
    }
  }

  async function sendMagicLink() {
    if (!email.trim()) {
      setStatus({
        intent: "error",
        message: s.magicNeedsEmail,
      });
      return;
    }

    setPending("magic");
    setStatus({ intent: "info", message: a.sendingLink });

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: getCallbackUrl() },
      });

      if (error) {
        setStatus({ intent: "error", message: error.message });
        return;
      }

      setStatus({
        intent: "success",
        message: s.magicSent,
      });
    } catch (error) {
      setStatus({
        intent: "error",
        message: error instanceof Error ? error.message : a.linkError,
      });
    } finally {
      setPending(null);
    }
  }

  async function signUpWithGoogle() {
    setPending("google");
    setStatus({ intent: "info", message: a.connectingGoogle });

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getCallbackUrl() },
    });

    if (error) {
      setStatus({ intent: "error", message: error.message });
      setPending(null);
    }
  }

  return (
    <AuthExperience
      eyebrow={s.eyebrow}
      title={s.title}
      description={s.description}
      footer={
        <div className="space-y-4 text-center">
          <p className="text-[11px] leading-5 text-zinc-600">
            {s.termsPrefix}{" "}
            <Link href="/terms" className="hover:text-zinc-300">
              {s.terms}
            </Link>{" "}
            {s.termsAnd}{" "}
            <Link href="/privacy" className="hover:text-zinc-300">
              {s.privacy}
            </Link>
            .
          </p>
          <p className="text-sm text-zinc-500">
            {s.hasAccount}{" "}
            <Link
              href="/login"
              className="font-semibold text-zinc-200 hover:text-violet-300"
            >
              {s.signIn}
            </Link>
          </p>
        </div>
      }
    >
      <GoogleAuthButton
        label={pending === "google" ? a.connecting : a.google}
        onClick={signUpWithGoogle}
        disabled={isBusy}
      />

      <AuthDivider label={s.divider} />

      <form onSubmit={createAccount} className="space-y-4">
        <div>
          <label htmlFor="signup-email" className="mb-2 block text-xs font-semibold text-zinc-400">
            {s.workEmail}
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" aria-hidden="true" />
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              required
              placeholder={a.emailPlaceholder}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`${authInputClassName} pl-11`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-password" className="mb-2 block text-xs font-semibold text-zinc-400">
            {a.password}
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" aria-hidden="true" />
            <input
              id="signup-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              placeholder={s.passwordPlaceholder}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={`${authInputClassName} pl-11`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isBusy}
          aria-busy={pending === "password"}
          className={authPrimaryButtonClassName}
        >
          {pending === "password" ? s.submitting : s.submit}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      <button
        type="button"
        onClick={sendMagicLink}
        disabled={isBusy}
        aria-busy={pending === "magic"}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 py-2 text-xs font-semibold text-zinc-500 transition hover:text-violet-300 disabled:opacity-50"
      >
        <WandSparkles className="h-3.5 w-3.5" aria-hidden="true" />
        {pending === "magic" ? a.sendingLinkShort : s.magic}
      </button>

      <AuthStatus status={status} />
    </AuthExperience>
  );
}
