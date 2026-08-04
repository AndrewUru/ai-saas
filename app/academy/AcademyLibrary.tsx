"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { AcademyLevel, AcademyPostSummary } from "@/lib/academy";

const LEVEL_OPTIONS: Array<AcademyLevel | "all"> = [
  "all",
  "beginner",
  "intermediate",
  "advanced",
];

const LEVEL_LABELS: Record<AcademyLevel | "all", string> = {
  all: "All levels",
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

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

      return normalize(
        [post.title, post.description, post.tags.join(" ")].join(" "),
      ).includes(q);
    });
  }, [posts, query, level, tag]);

  const hasActiveFilters = Boolean(query) || level !== "all" || tag !== "all";

  function clearFilters() {
    setQuery("");
    setLevel("all");
    setTag("all");
  }

  return (
    <div className="space-y-6">
      <div className="ui-card p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <label>
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
              <Search className="h-3.5 w-3.5" aria-hidden="true" />
              Search resources
            </span>
            <input
              type="search"
              placeholder="Search guides, goals, or topics..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="ui-input w-full"
            />
          </label>

          <FilterSelect
            label="Level"
            value={level}
            onChange={(value) => setLevel(value as AcademyLevel | "all")}
            options={LEVEL_OPTIONS.map((option) => ({
              value: option,
              label: LEVEL_LABELS[option],
            }))}
          />

          <FilterSelect
            label="Topic"
            value={tag}
            onChange={setTag}
            options={tags.map((entry) => ({
              value: entry,
              label: entry === "all" ? "All topics" : entry,
            }))}
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4">
          <p className="text-xs text-[var(--foreground-muted)]" aria-live="polite">
            Showing {filtered.length} of {posts.length} resources
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-semibold text-accent transition hover:text-foreground"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/20 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-accent">
            <Search className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-4 font-semibold text-foreground">
            No resources found
          </h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--foreground-muted)]">
            Try a broader search or clear the active filters to see the full
            Academy library.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="ui-button ui-button--ghost mt-6"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((post) => (
            <article
              key={post.slug}
              className="ui-card group relative flex min-h-72 flex-col p-6 transition duration-200 hover:-translate-y-0.5 hover:border-accent/35 hover:shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="ui-badge">{LEVEL_LABELS[post.level]}</span>
                <time
                  dateTime={post.date}
                  className="text-xs text-[var(--foreground-muted)]"
                >
                  {post.dateLabel}
                </time>
              </div>

              <div className="mt-6 flex h-10 w-10 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </div>

              <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
                <Link
                  href={"/academy/" + post.slug}
                  className="outline-none transition group-hover:text-accent focus-visible:text-accent"
                >
                  <span className="absolute inset-0" aria-hidden="true" />
                  {post.title}
                </Link>
              </h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--foreground-muted)]">
                {post.description}
              </p>

              <div className="mt-auto flex items-end justify-between gap-4 pt-6">
                <div className="flex flex-wrap gap-2">
                  {post.tags.slice(0, 2).map((entry) => (
                    <span
                      key={entry}
                      className="rounded-full border border-border bg-background/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--foreground-muted)]"
                    >
                      {entry}
                    </span>
                  ))}
                </div>
                <ArrowUpRight
                  className="h-5 w-5 shrink-0 text-[var(--foreground-muted)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                  aria-hidden="true"
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label>
      <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
        <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="ui-input w-full appearance-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
