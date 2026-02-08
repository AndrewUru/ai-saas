import React from "react";
import { Mail, Zap, ArrowRight } from "lucide-react";

export default function ContactPage() {
  return (
    // Cambio: Fondo negro profundo (#050505) con selección de texto personalizada
    <main
      className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-emerald-500/30 selection:text-emerald-200"
      data-oid=".x7xqrj"
    >
      {/* Efecto de luz ambiental superior */}
      <div
        className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#050505]/0 to-transparent"
        data-oid="hmqnhfj"
      />

      <section
        className="relative z-10 mx-auto max-w-4xl px-6 py-24 sm:px-10 lg:px-16"
        data-oid="xhxjqbp"
      >
        {/* Header */}
        <header
          className="space-y-4 text-center sm:text-left"
          data-oid="p-yytkk"
        >
          <div
            className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-emerald-400 backdrop-blur-sm"
            data-oid="i9ki1b5"
          >
            Agency Support
          </div>

          <h1
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl"
            data-oid="ua.kuaa"
          >
            Let’s talk about your{" "}
            <span className="text-emerald-400" data-oid="83imacs">
              implementation
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-neutral-400" data-oid="kenlqwd">
            Reach out to resolve technical questions, prepare client demos, or
            discuss enterprise plans tailored to your needs.
          </p>
        </header>

        {/* Grid de opciones */}
        <div className="mt-16 grid gap-6 md:grid-cols-2" data-oid="360dn-:">
          {/* Tarjeta 1: Email Support */}
          <div
            className="group relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/40 p-8 transition-all duration-300 hover:border-emerald-500/50 hover:bg-neutral-900/60 hover:shadow-2xl hover:shadow-emerald-900/20"
            data-oid="t8fsaf2"
          >
            <div
              className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-white group-hover:bg-emerald-500 group-hover:text-black transition-colors"
              data-oid="ybbp-3o"
            >
              <Mail className="h-6 w-6" data-oid="nydmcqv" />
            </div>

            <h2 className="text-xl font-bold text-white" data-oid="zvirg2_">
              Email support
            </h2>
            <p
              className="mt-2 text-sm text-neutral-400 leading-relaxed"
              data-oid="0xdcvcy"
            >
              Send your inquiry including the store URL and the number of agents
              you plan to deploy.
            </p>

            <div className="mt-8" data-oid="0z:zys3">
              <a
                href="mailto:atobio459@gmail.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
                data-oid="l-r2bqw"
              >
                atobio459@gmail.com
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  data-oid="r3607:8"
                />
              </a>
            </div>
          </div>

          {/* Tarjeta 2: Strategy Session */}
          <div
            className="group relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/40 p-8 transition-all duration-300 hover:border-emerald-500/50 hover:bg-neutral-900/60 hover:shadow-2xl hover:shadow-emerald-900/20"
            data-oid="43vww3u"
          >
            {/* Pequeño gradiente decorativo */}
            <div
              className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl transition-all group-hover:bg-emerald-500/20"
              data-oid="fksogu1"
            ></div>

            <div
              className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-800 text-white group-hover:bg-emerald-500 group-hover:text-black transition-colors"
              data-oid="jbbbp_v"
            >
              <Zap className="h-6 w-6" data-oid="f_9l3am" />
            </div>

            <h2 className="text-xl font-bold text-white" data-oid="z:g8_mj">
              Book a strategy session
            </h2>
            <p
              className="mt-2 text-sm text-neutral-400 leading-relaxed"
              data-oid="w51j2x5"
            >
              We run integration workshops and prompt audits with your team.
              Request a session via email or dashboard.
            </p>

            <div
              className="mt-8 flex items-center gap-2 text-sm font-medium text-neutral-500"
              data-oid="p0gxbot"
            >
              <span data-oid="sn158m-">Available via Dashboard</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
