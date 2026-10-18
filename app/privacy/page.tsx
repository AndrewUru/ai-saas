import type { Metadata } from "next";

import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.privacy.meta.title };
}

export default async function PrivacyPage() {
  const { t } = await getI18n();
  const p = t.privacy;

  return (
    <main className="bg-slate-950 text-slate-100" data-oid="9hctdf7">
      <section
        className="mx-auto max-w-4xl px-6 py-20 sm:px-10 lg:px-16"
        data-oid="gj3smun"
      >
        <header className="space-y-3" data-oid="m6xwru:">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-300"
            data-oid="zl3ndeo"
          >
            {p.eyebrow}
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl" data-oid="muompsk">
            {p.title}
          </h1>
          <p className="text-sm text-slate-300 sm:text-base" data-oid="ysy0brf">
            {p.intro}
          </p>
        </header>

        <article
          className="mt-12 space-y-6 text-sm text-slate-300"
          data-oid="k48dkg:"
        >
          {p.sections.map((section) => (
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
