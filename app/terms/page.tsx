import type { Metadata } from "next";

import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.terms.meta.title };
}

export default async function TermsPage() {
  const { t } = await getI18n();
  const terms = t.terms;

  return (
    <main className="bg-slate-950 text-slate-100" data-oid="-45ef.6">
      <section
        className="mx-auto max-w-4xl px-6 py-20 sm:px-10 lg:px-16"
        data-oid="4pdj6pb"
      >
        <header className="space-y-3" data-oid="skmnyi1">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-300"
            data-oid=":gv9g6_"
          >
            {terms.eyebrow}
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl" data-oid="a3lja0m">
            {terms.title}
          </h1>
          <p className="text-sm text-slate-300 sm:text-base" data-oid="s8:7cn8">
            {terms.intro}
          </p>
        </header>

        <article
          className="mt-12 space-y-6 text-sm text-slate-300"
          data-oid="2d:s8cf"
        >
          {terms.sections.map((section) => (
            <section key={section.title} className="space-y-2">
              <h2 className="text-lg font-semibold text-white">
                {section.title}
              </h2>
              <p>{section.body}</p>
            </section>
          ))}
        </article>
      </section>
    </main>
  );
}
