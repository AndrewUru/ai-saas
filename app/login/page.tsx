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
import { createClient } from "@/lib/supabase/client";

type PendingAction = "password" | "magic" | "google" | null;

function getCallbackUrl() {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
  return `${origin}/auth/callback?next=/dashboard`;
}
export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<PendingAction>(null);
  const [status, setStatus] = useState<AuthStatusValue>(null);
  const isBusy = pending !== null;

  async function signInWithPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending("password");
    setStatus({ intent: "info", message: "Comprobando tus datos..." });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setStatus({ intent: "error", message: error.message });
        return;
      }

      setStatus({ intent: "success", message: "Acceso correcto." });
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setStatus({
        intent: "error",
        message: error instanceof Error ? error.message : "No se pudo iniciar sesión.",
      });
    } finally {
      setPending(null);
    }
  }

  async function sendMagicLink() {
    if (!email.trim()) {
      setStatus({
        intent: "error",
        message: "Escribe tu email para recibir el enlace de acceso.",
      });
      return;
    }

    setPending("magic");
    setStatus({ intent: "info", message: "Enviando tu enlace seguro..." });

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
        message: "Revisa tu bandeja de entrada para continuar.",
      });
    } catch (error) {
      setStatus({
        intent: "error",
        message: error instanceof Error ? error.message : "No se pudo enviar el enlace.",
      });
    } finally {
      setPending(null);
    }
  }

  async function signInWithGoogle() {
    setPending("google");
    setStatus({ intent: "info", message: "Conectando con Google..." });

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
      eyebrow="Bienvenido de nuevo"
      title="Entra en tu espacio."
      description="Continúa donde lo dejaste y gestiona tus agentes desde un único lugar."
      footer={
        <p className="text-center text-sm text-zinc-500">
          ¿Aún no tienes cuenta?{" "}
          <Link
            href="/signup"
            className="font-semibold text-zinc-200 hover:text-violet-300"
          >
            Crear cuenta
          </Link>
        </p>
      }
    >
      <GoogleAuthButton
        label={pending === "google" ? "Conectando..." : "Continuar con Google"}
        onClick={signInWithGoogle}
        disabled={isBusy}
      />

      <AuthDivider />

      <form onSubmit={signInWithPassword} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="mb-2 block text-xs font-semibold text-zinc-400">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              placeholder="tu@empresa.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`${authInputClassName} pl-11`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className="mb-2 block text-xs font-semibold text-zinc-400">
            Contraseña
          </label>
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" aria-hidden="true" />
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Tu contraseña"
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
          {pending === "password" ? "Entrando..." : "Entrar"}
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
        {pending === "magic" ? "Enviando enlace..." : "Entrar sin contraseña"}
      </button>

      <AuthStatus status={status} />
    </AuthExperience>
  );
}
