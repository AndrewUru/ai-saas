import type { Metadata } from "next";

import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t.changelog.meta.title };
}

export default async function ChangelogPage() {
  const { t } = await getI18n();
  const c = t.changelog;
  const entries = c.entries;

  return (
    <main className="bg-slate-950 text-slate-100" data-oid="c1xi924">
      <section
        className="mx-auto max-w-4xl px-6 py-20 sm:px-10 lg:px-16"
        data-oid="7y:kp7m"
      >
        <header className="space-y-3" data-oid="u9596i:">
          <p
            className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-300"
            data-oid="8quh773"
          >
            {c.eyebrow}
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl" data-oid="1gebve9">
            {c.title}
          </h1>
          <p className="text-sm text-slate-300 sm:text-base" data-oid="h50jhm9">
            {c.intro}
          </p>
        </header>

        <div className="mt-12 space-y-8" data-oid=":hq:94u">
          {entries.map((entry) => (
            <article
              key={entry.date}
              className="rounded-3xl border border-slate-800/60 p-6 shadow-lg shadow-slate-900/40 backdrop-blur"
              data-oid="2sp8pgg"
            >
              <header
                className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
                data-oid="qvc80o9"
              >
                <h2
                  className="text-lg font-semibold text-white"
                  data-oid="f173i1r"
                >
                  {entry.title}
                </h2>
                <span
                  className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-300"
                  data-oid="a2wivy8"
                >
                  {entry.date}
                </span>
              </header>
              <ul
                className="mt-4 list-disc space-y-2 pl-6 text-sm text-slate-300"
                data-oid="6:3_n9v"
              >
                {entry.items.map((item) => (
                  <li key={item} data-oid="96d0yx2">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
