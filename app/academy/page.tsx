import type { ReactNode } from "react";
import { BookOpen, GraduationCap, Layers, Sparkles } from "lucide-react";
import AcademyLibrary from "./AcademyLibrary";
import { getAllAcademyPosts } from "@/lib/academy";

export default async function AcademyPage() {
  const posts = await getAllAcademyPosts();
  const levelCount = new Set(posts.map((post) => post.level)).size;
  const tagCount = new Set(posts.flatMap((post) => post.tags)).size;

  return (
    <main className="min-h-screen text-foreground">
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <header className="ui-card--strong relative overflow-hidden p-6 sm:p-10 lg:p-12">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/15 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
            <div>
              <p className="ui-badge w-fit">
                <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
                Academy
              </p>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Build better ecommerce agents, faster.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Practical guides, implementation playbooks, and reusable
                checklists for launching reliable AI experiences across your
                clients&apos; stores.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <AcademyStat
                icon={<BookOpen className="h-4 w-4" aria-hidden="true" />}
                label="Guides"
                value={posts.length}
              />
              <AcademyStat
                icon={<Layers className="h-4 w-4" aria-hidden="true" />}
                label="Levels"
                value={levelCount}
              />
              <AcademyStat
                icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
                label="Topics"
                value={tagCount}
              />
            </div>
          </div>
        </header>

        <section aria-labelledby="academy-library-title">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Resource library
              </p>
              <h2
                id="academy-library-title"
                className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              >
                Learn at your own pace
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-[var(--foreground-muted)] sm:text-right">
              Search by goal, narrow the library by experience level, or
              explore a specific topic.
            </p>
          </div>

          <AcademyLibrary posts={posts} />
        </section>
      </section>
    </main>
  );
}

function AcademyStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
        {icon}
      </span>
      <p className="mt-4 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}
