export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-16">
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Agencies and digital brands that trust us
          </h2>
          <p className="mt-4 text-base text-slate-300 sm:text-lg">
            Retail, subscription, and DTC teams rely on our agents to keep
            support running 24/7 and protect each brand voice.
          </p>
        </div>
        <div className="space-y-6 lg:col-span-2">
          {[
            {
              quote:
                "We replaced an entire support shift and now resolve 82% of tickets automatically. Our customers notice the instant response.",
              author: "Lucia Torres",
              role: "Head of CX, Nordia Beauty",
            },
            {
              quote:
                "Connecting WooCommerce took less than five minutes. Seeing real orders in chat lets us propose upsells before our competitors do.",
              author: "Victor Ramirez",
              role: "Founder, Casa Moda Store",
            },
            {
              quote:
                "Analytics show us which prompts convert best and when to involve a human. It’s like having a teammate that never sleeps.",
              author: "Ana Walker",
              role: "COO, Sunwave Gear",
            },
          ].map((testimonial) => (
            <figure
              key={testimonial.author}
              className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 shadow-lg shadow-slate-900/40"
            >
              <blockquote className="text-lg text-slate-200">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-sm text-slate-400">
                <span className="font-semibold text-white">
                  {testimonial.author}
                </span>{" "}
                &mdash; {testimonial.role}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
