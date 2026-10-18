import type { Metadata } from "next";

import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.blog.meta.title };
}

export default async function BlogPage() {
  const { t } = await getI18n();
  const b = t.blog;

  return (
    <main className="bg-slate-950 text-slate-100" data-oid="9t:81fa">
      <section
        className="mx-auto max-w-5xl px-6 py-24 sm:px-10 lg:px-16"
        data-oid="kwv8yp0"
      >
        <header
          className="space-y-4 text-center sm:text-left"
          data-oid="8z8_t-t"
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-300"
            data-oid="-9_s3v."
          >
            {b.eyebrow}
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl" data-oid="1gt4ba.">
            {b.title}
          </h1>
          <p className="text-base text-slate-300 sm:text-lg" data-oid="jsuh2vm">
            {b.intro}
          </p>
        </header>

        <div className="mt-16 space-y-8" data-oid="rdmeakg">
          <article
            className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8"
            data-oid="wlipncb"
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-300"
              data-oid="qt-br5l"
            >
              {b.featured}
            </p>
            <h2
              className="mt-3 text-xl font-semibold text-white"
              data-oid="3wtdfyk"
            >
              {b.featuredTitle}
            </h2>
            <p className="mt-3 text-sm text-slate-300" data-oid="gs7c6nc">
              {b.featuredBody}
            </p>
          </article>

          <article
            className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8"
            data-oid="mgjdhe8"
          >
            <h2 className="text-xl font-semibold text-white" data-oid="qyyvfby">
              {b.upcomingTitle}
            </h2>
            <p className="mt-3 text-sm text-slate-300" data-oid="aqc1992">
              {b.upcomingBody}
            </p>
            <form
              className="mt-6 flex flex-col gap-3 sm:flex-row"
              data-oid="4dvku5c"
            >
              <input
                type="email"
                placeholder={b.emailPlaceholder}
                className="w-full rounded-full border border-slate-700 bg-slate-950/80 px-5 py-3 text-sm text-white placeholder:text-slate-500 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400/30"
                data-oid="soe:afm"
              />

              <button
                type="submit"
                className="rounded-full bg-neutral-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-neutral-300"
                data-oid="_mrxg-g"
              >
                {b.notifyMe}
              </button>
            </form>
          </article>
        </div>
      </section>
    </main>
  );
}
