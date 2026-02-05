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
    <main className="bg-slate-950 text-slate-100">
      <section className="mx-auto max-w-4xl px-6 py-24 sm:px-10 lg:px-16">
        <div className="space-y-6">
          <Link
            href="/academy"
            className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300"
          >
            ← Back to Academy
          </Link>

          <header className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {post.level} - <time dateTime={post.date}>{post.dateLabel}</time>
            </p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              {post.title}
            </h1>
            <p className="text-base text-slate-300 sm:text-lg">
              {post.description}
            </p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <article className="prose prose-invert max-w-none prose-headings:text-white prose-a:text-emerald-300 prose-strong:text-white">
            <MDXRemote source={post.content} />
          </article>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-slate-800 pt-8 sm:flex-row sm:items-center sm:justify-between">
          {previous ? (
            <Link
              href={`/academy/${previous.slug}`}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-200"
            >
              ← Previous: {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/academy/${next.slug}`}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-200 transition hover:border-emerald-400/40 hover:text-emerald-200"
            >
              Next: {next.title} →
            </Link>
          ) : null}
        </div>
      </section>
    </main>
  );
}
