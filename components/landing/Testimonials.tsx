export function Testimonials() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-16">
      <div className="grid gap-12 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="text-3xl font-semibold sm:text-4xl text-foreground">
            Agencies and digital brands that trust us
          </h2>
          <p className="mt-4 text-base text-[var(--foreground-muted)] sm:text-lg">
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
            <figure key={testimonial.author} className="ui-card p-8">
              <blockquote className="text-lg text-[var(--foreground-muted)]">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-4 text-sm text-[var(--foreground-muted)]">
                <span className="font-semibold text-foreground">
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
