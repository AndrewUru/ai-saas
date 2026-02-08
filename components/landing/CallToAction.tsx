export function CallToAction() {
  return (
    <section
      className="relative overflow-hidden bg-[#030303] py-24 sm:py-32"
      data-oid="7:h5swh"
    >
      {/* 1. Efecto de Iluminación Central (Focus Glow) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[800px] max-h-[400px] bg-accent/10 blur-[160px] rounded-[100%] pointer-events-none opacity-50 z-0"
        data-oid="gccfzfj"
      />

      {/* 2. Divisor de gradiente superior sutil */}
      <div
        className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
        data-oid="9wo6pll"
      />

      <div
        className="relative z-10 mx-auto max-w-4xl px-6 text-center lg:px-8"
        data-oid="ligmt1-"
      >
        <div className="space-y-8" data-oid="3ajtoc6">
          {/* Badge minimalista */}
          <span
            className="inline-block text-xs font-bold uppercase tracking-[0.4em] text-accent/80"
            data-oid="j8nc00o"
          >
            Ready to scale
          </span>

          {/* Headline con gradiente inverso para impacto */}
          <h2
            className="text-4xl font-bold tracking-tight text-white sm:text-6xl"
            data-oid="gwg765."
          >
            Launch your first agent <br data-oid="tl04gqg" />
            <span className="text-zinc-500" data-oid="qhvdbtl">
              for a client today.
            </span>
          </h2>

          <p
            className="mx-auto max-w-xl text-lg leading-relaxed text-zinc-400"
            data-oid="5bqlwjm"
          >
            Create an account, connect WooCommerce, and deliver a high-end AI
            support experience in under an hour.
          </p>

          {/* Botones de acción con jerarquía clara */}
          <div
            className="flex flex-col items-center justify-center gap-6 pt-6 sm:flex-row"
            data-oid="xxla:cd"
          >
            <a
              href="/signup"
              className="group relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-white px-10 font-bold text-black transition-all hover:scale-105 active:scale-95"
              data-oid="fdft12h"
            >
              {/* Sutil brillo al pasar el mouse */}
              <div
                className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]"
                data-oid="gr0xiyx"
              >
                <div
                  className="relative h-full w-8 bg-black/5"
                  data-oid="lrz5j1j"
                />
              </div>
              Create free account
            </a>

            <a
              href="/pricing"
              className="group flex items-center gap-2 text-sm font-bold text-white transition-colors hover:text-accent"
              data-oid="p_zsacr"
            >
              View pricing plans
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                data-oid=".17b9du"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                  data-oid="xok44aa"
                />
              </svg>
            </a>
          </div>

          {/* Micro-copy final */}
          <p
            className="pt-4 text-xs font-medium text-zinc-600"
            data-oid="5gkb6dn"
          >
            No credit card required.{" "}
            <span className="text-zinc-400" data-oid="3lobi6s">
              Upgrade as you grow.
            </span>
          </p>
        </div>
      </div>

      {/* 3. Decoración Inferior (Vibe Dark Tech) */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-2/3 bg-gradient-to-r from-transparent via-accent/30 to-transparent"
        data-oid="24m4xn1"
      />
    </section>
  );
}
