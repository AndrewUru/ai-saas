import type { Metadata } from "next";

import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.about.meta.title };
}

export default async function AboutPage() {
  const { t } = await getI18n();
  const a = t.about;

  return (
    <main className="text-slate-100" data-oid="472x0q2">
      <section
        className="mx-auto max-w-5xl px-6 py-24 sm:px-10 lg:px-16"
        data-oid="5vnxk7l"
      >
        <header
          className="space-y-4 text-center sm:text-left"
          data-oid="a3ni6fy"
        >
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-300"
            data-oid="7qatfon"
          >
            {a.eyebrow}
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl" data-oid="vxp:wrl">
            {a.title}
          </h1>
          <p className="text-base text-slate-300 sm:text-lg" data-oid="urv3db7">
            {a.intro}
          </p>
        </header>

        <div className="mt-16 grid gap-8 md:grid-cols-2" data-oid="epiq9.w">
          <article
            className="space-y-3 rounded-3xl border border-slate-800  p-8"
            data-oid="odb3zup"
          >
            <h2 className="text-xl font-semibold text-white" data-oid="--ng9c3">
              {a.manifestoTitle}
            </h2>
            <p className="text-sm text-slate-300" data-oid="rco6808">
              {a.manifestoBody}
            </p>
          </article>
          <article
            className="space-y-3 rounded-3xl border border-slate-800 p-8"
            data-oid="4txaq9j"
          >
            <h2 className="text-xl font-semibold text-white" data-oid="g2.y:x3">
              {a.nextTitle}
            </h2>
            <p className="text-sm text-slate-300" data-oid="b82c0hc">
              {a.nextBody}
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
