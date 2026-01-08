import React from "react";
import { Mail, Zap, ArrowRight } from "lucide-react";

export default function ContactPage() {
  return (
    // Cambio: Fondo negro profundo (#050505) con selección de texto personalizada
    <main className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Efecto de luz ambiental superior */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#050505]/0 to-transparent" />

      <section className="relative z-10 mx-auto max-w-4xl px-6 py-24 sm:px-10 lg:px-16">
        {/* Header */}
        <header className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-emerald-400 backdrop-blur-sm">
            Agency Support
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Let’s talk about your{" "}
            <span className="text-emerald-400">implementation</span>
          </h1>

          <p className="max-w-2xl text-lg text-neutral-400">
            Reach out to resolve technical questions, prepare client demos, or
            discuss enterprise plans tailored to your needs.
          </p>
        </header>

        {/* Grid de opciones */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          {/* Tarjeta 1: Email Support */}
          <div className="group relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/40 p-8 transition-all duration-300 hover:border-emerald-500/50 hover:bg-neutral-900/60 hover:shadow-2xl hover:shadow-emerald-900/20">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-white group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              <Mail className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-bold text-white">Email support</h2>
            <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
              Send your inquiry including the store URL and the number of agents
              you plan to deploy.
            </p>

            <div className="mt-8">
              <a
                href="mailto:atobio459@gmail.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
              >
                atobio459@gmail.com
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </div>

          {/* Tarjeta 2: Strategy Session */}
          <div className="group relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/40 p-8 transition-all duration-300 hover:border-emerald-500/50 hover:bg-neutral-900/60 hover:shadow-2xl hover:shadow-emerald-900/20">
            {/* Pequeño gradiente decorativo */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl transition-all group-hover:bg-emerald-500/20"></div>

            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-white group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              <Zap className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-bold text-white">
              Book a strategy session
            </h2>
            <p className="mt-2 text-sm text-neutral-400 leading-relaxed">
              We run integration workshops and prompt audits with your team.
              Request a session via email or dashboard.
            </p>

            <div className="mt-8 flex items-center gap-2 text-sm font-medium text-neutral-500">
              <span>Available via Dashboard</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
