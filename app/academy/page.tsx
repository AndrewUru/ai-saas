//C:\ai-saas\app\academy\page.tsx
import AcademyLibrary from "./AcademyLibrary";
import { getAllAcademyPosts } from "@/lib/academy";

export default async function AcademyPage() {
  const posts = await getAllAcademyPosts();

  return (
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-10 lg:px-16">
        <header className="space-y-4 text-center sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Agency academy
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Certify your team in implementing ecommerce agents
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Get access to live sessions, downloadable playbooks, and prompt
            libraries ready to reuse with clients on WooCommerce, Shopify, or
            headless storefronts.
          </p>
        </header>

        <div className="mt-12 space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                Library
              </p>
              <h2 className="text-2xl font-semibold text-white">
                Guides, playbooks, and delivery checklists
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                Search by keyword, filter by level, or browse tags to find the
                right resource.
              </p>
            </div>
          </div>

          <AcademyLibrary posts={posts} />
        </div>
      </section>
    </main>
  );
}
