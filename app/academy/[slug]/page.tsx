import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import {
  getAcademyPostBySlug,
  getAdjacentPosts,
  getAllAcademyPosts,
} from "@/lib/academy";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllAcademyPosts(false);
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getAcademyPostBySlug(slug);

  if (!post) {
    return { title: "Academy" };
  }

  return {
    title: `${post.title} | Academy`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: new Date(post.dateSort).toISOString(),
      tags: post.tags,
    },
  };
}

export default async function AcademyPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getAcademyPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { previous, next } = await getAdjacentPosts(slug);

  return (
    <main className="bg-slate-950 text-slate-100" data-oid="qjhrsny">
      <section
        className="mx-auto max-w-4xl px-6 py-24 sm:px-10 lg:px-16"
        data-oid="s_l63z_"
      >
        <div className="space-y-6" data-oid="9_xf2bk">
          <Link
            href="/academy"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300"
            data-oid="w8sq9hf"
          >
            ← Back to Academy
          </Link>

          <header className="space-y-3" data-oid="2atalqr">
            <p
              className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
              data-oid="5tua4:1"
            >
              {post.level} -{" "}
              <time dateTime={post.date} data-oid="1xtjh2n">
                {post.dateLabel}
              </time>
            </p>
            <h1
              className="text-3xl font-bold text-white sm:text-4xl"
              data-oid="a33ei2l"
            >
              {post.title}
            </h1>
            <p
              className="text-base text-slate-300 sm:text-lg"
              data-oid="awz-.oe"
            >
              {post.description}
            </p>
            <div className="flex flex-wrap gap-2" data-oid="-4-s2oy">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300"
                  data-oid="qa1u0w8"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <article
            className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-emerald-300 prose-strong:text-white"
            data-oid="dmbtbwb"
          >
            <MDXRemote source={post.content} data-oid="ie83lr9" />
          </article>
        </div>

        <div
          className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-8 sm:flex-row sm:items-center sm:justify-between"
          data-oid="4edy3a0"
        >
          {previous ? (
            <Link
              href={`/academy/${previous.slug}`}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-200"
              data-oid="i2piie:"
            >
              ← Previous: {previous.title}
            </Link>
          ) : (
            <span data-oid="3o4uxhh" />
          )}
          {next ? (
            <Link
              href={`/academy/${next.slug}`}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-200"
              data-oid="k9rq740"
            >
              Next: {next.title} →
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
