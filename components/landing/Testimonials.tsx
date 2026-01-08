export function Testimonials() {
  const testimonials = [
    {
      quote:
        "We replaced an entire support shift and now resolve 82% of tickets automatically. Our customers notice the instant response.",
      author: "Lucia Torres",
      role: "Head of CX, Nordia Beauty",
      initials: "LT",
    },
    {
      quote:
        "Connecting WooCommerce took less than five minutes. Seeing real orders in chat lets us propose upsells before our competitors do.",
      author: "Victor Ramirez",
      role: "Founder, Casa Moda Store",
      initials: "VR",
    },
    {
      quote:
        "Analytics show us which prompts convert best and when to involve a human. It’s like having a teammate that never sleeps.",
      author: "Ana Walker",
      role: "COO, Sunwave Gear",
      initials: "AW",
    },
  ];

  return (
    <section className="relative bg-[#030303] py-24 sm:py-32 overflow-hidden">
      {/* Luz ambiental sutil en el fondo */}
      <div className="absolute right-0 top-1/4 h-[500px] w-[500px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-3 lg:items-start">
          {/* Header de la sección */}
          <div className="lg:sticky lg:top-32">
            <h2 className="text-base font-semibold uppercase tracking-[0.2em] text-accent">
              Success Stories
            </h2>
            <h3 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Agencies <span className="text-zinc-500">trust us.</span>
            </h3>
            <p className="mt-6 text-lg leading-relaxed text-zinc-400">
              Retail, subscription, and DTC teams rely on our agents to keep
              support running 24/7.
            </p>

            {/* Social Proof extra: Logos minimalistas */}
            <div className="mt-10 flex flex-wrap gap-8 opacity-30 grayscale contrast-200">
              <span className="text-xl font-bold text-white tracking-tighter">
                NORDIA
              </span>
              <span className="text-xl font-bold text-white tracking-tighter">
                MODA.
              </span>
              <span className="text-xl font-bold text-white tracking-tighter">
                SUNWAVE
              </span>
            </div>
          </div>

          {/* Lista de Testimonios */}
          <div className="lg:col-span-2 space-y-8">
            {testimonials.map((testimonial, idx) => (
              <figure
                key={testimonial.author}
                className={`relative overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.01] p-10 transition-all duration-500 hover:bg-white/[0.03] hover:border-white/10 ${
                  idx % 2 !== 0 ? "lg:translate-x-4" : ""
                }`}
              >
                {/* Comilla decorativa gigante */}
                <span className="absolute -top-4 -left-2 text-[12rem] leading-none text-white/[0.02] font-serif pointer-events-none select-none">
                  “
                </span>

                <blockquote className="relative z-10">
                  <p className="text-xl md:text-2xl font-medium leading-snug text-zinc-200">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </blockquote>

                <figcaption className="relative z-10 mt-10 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10 text-xs font-bold text-white">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-zinc-500">
                      {testimonial.role}
                    </div>
                  </div>
                </figcaption>

                {/* Línea de acento sutil al hacer hover */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-accent transition-all duration-500 group-hover:w-full" />
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
