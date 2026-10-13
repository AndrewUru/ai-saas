import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";

type AuthExperienceProps = {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  footer?: React.ReactNode;
  title: string;
};

export default function AuthExperience({
  children,
  description,
  eyebrow,
  footer,
  title,
}: AuthExperienceProps) {
  return (
    <main className="relative min-h-svh overflow-hidden bg-[#090a0e] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
      >
        <div className="absolute left-[8%] top-[8%] h-80 w-80 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-[-12rem] right-[-8rem] h-[32rem] w-[32rem] rounded-full bg-white/[0.035] blur-[100px]" />
        <div className="landing-grid absolute inset-0 opacity-35" />
      </div>

      <header className="absolute inset-x-0 top-0 z-20 flex h-20 items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" aria-label="Volver al inicio" className="inline-flex">
          <Image
            src="/logo.svg"
            alt="AICommerce"
            width={150}
            height={26}
            priority
            className="h-7 w-auto"
          />
        </Link>

        <Link
          href="/"
          aria-label="Volver al inicio"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 text-xs font-semibold text-zinc-400 transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="hidden sm:inline">Volver al inicio</span>
        </Link>
      </header>

      <div className="relative mx-auto grid min-h-svh w-full max-w-7xl lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
        <aside className="relative hidden items-center px-12 pb-12 pt-24 lg:flex xl:px-20">
          <div className="max-w-xl">
            <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-[20px] border border-violet-300/20 bg-gradient-to-br from-violet-500 to-violet-900 shadow-[0_18px_60px_rgba(124,58,237,0.28)]">
              <Sparkles className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
              AI Commerce Agents
            </p>
            <h2 className="mt-5 max-w-lg text-balance text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-zinc-50 xl:text-6xl">
              Todo tu equipo de IA en un solo lugar.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-zinc-500">
              Configura, entrena y publica agentes que acompañan a tus clientes
              en cada conversación.
            </p>

            <div className="mt-10 inline-flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.035] px-4 py-3 text-xs text-zinc-400 backdrop-blur-xl">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              </span>
              Acceso privado y protegido
            </div>
          </div>
        </aside>

        <section className="flex min-h-svh items-center border-white/[0.06] px-5 pb-10 pt-24 lg:border-l lg:bg-black/10 lg:px-12">
          <div className="mx-auto w-full max-w-[420px] landing-stage-in">
            <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/15 bg-violet-500/15 text-violet-300 shadow-[0_12px_40px_rgba(124,58,237,0.2)] lg:hidden">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-violet-300">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.035em] text-zinc-50 sm:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">
              {description}
            </p>

            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-7">{footer}</div> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
