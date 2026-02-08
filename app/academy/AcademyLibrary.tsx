// C:\ai-saas\app\academy\AcademyLibrary.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AcademyLevel, AcademyPostSummary } from "@/lib/academy";

const LEVEL_OPTIONS: Array<AcademyLevel | "all"> = [
  "all",
  "beginner",
  "intermediate",
  "advanced",
];

type Props = {
  posts: AcademyPostSummary[];
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export default function AcademyLibrary({ posts }: Props) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<AcademyLevel | "all">("all");
  const [tag, setTag] = useState("all");

  const tags = useMemo(() => {
    const unique = new Set<string>();
    for (const post of posts) {
      for (const entry of post.tags) {
        if (entry.trim()) unique.add(entry);
      }
    }
    return ["all", ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [posts]);

  const filtered = useMemo(() => {
    const q = normalize(query);

    return posts.filter((post) => {
      if (level !== "all" && post.level !== level) return false;
      if (tag !== "all" && !post.tags.includes(tag)) return false;

      if (!q) return true;

      const haystack = [post.title, post.description, post.tags.join(" ")]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [posts, query, level, tag]);

  return (
    <div className="space-y-6" data-oid="2..i:o9">
      <div
        className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:flex-row sm:items-center sm:justify-between"
        data-oid="1d6bjt8"
      >
        <div className="flex-1" data-oid="_.77ju1">
          <label
            className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
            data-oid="vz9_eo3"
          >
            Search
          </label>
          <input
            type="search"
            placeholder="Search by title, description, or tag..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
            data-oid="po26k9-"
          />
        </div>

        <div className="flex flex-wrap gap-3" data-oid="jc9dwtb">
          <label
            className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
            data-oid="8nwxmrk"
          >
            Level
            <select
              value={level}
              onChange={(event) =>
                setLevel(event.target.value as AcademyLevel | "all")
              }
              className="mt-2 block w-full min-w-[180px] rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
              data-oid="hydu3iz"
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option} value={option} data-oid="ya._35v">
                  {option === "all"
                    ? "All levels"
                    : option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </label>

          <label
            className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400"
            data-oid="dvec2vn"
          >
            Tag
            <select
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              className="mt-2 block w-full min-w-[180px] rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
              data-oid="acdg6dc"
            >
              {tags.map((entry) => (
                <option key={entry} value={entry} data-oid="frxe_4p">
                  {entry === "all" ? "All tags" : entry}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 text-sm text-slate-300"
          data-oid="ggixpt3"
        >
          No posts match your filters. Try clearing the search or choosing a
          different tag.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2" data-oid="hjzr01r">
          {filtered.map((post) => (
            <article
              key={post.slug}
              className="group rounded-3xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-emerald-400/40"
              data-oid="tq32y6m"
            >
              <div
                className="flex items-center justify-between text-xs text-slate-400"
                data-oid="-1pkts7"
              >
                <span
                  className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-200"
                  data-oid="wu0:8h_"
                >
                  {post.level}
                </span>
                <time dateTime={post.date} data-oid="n-2wrr8">
                  {post.dateLabel}
                </time>
              </div>
              <h3
                className="mt-4 text-lg font-semibold text-white transition group-hover:text-emerald-200"
                data-oid="-3xwrwy"
              >
                <Link href={`/academy/${post.slug}`} data-oid="gz7w2qu">
                  {post.title}
                </Link>
              </h3>
              <p className="mt-3 text-sm text-slate-300" data-oid="v7zwap7">
                {post.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2" data-oid="p2v_gp3">
                {post.tags.map((entry) => (
                  <span
                    key={entry}
                    className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-300"
                    data-oid="ptb1wqe"
                  >
                    {entry}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
