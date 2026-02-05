import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export type AcademyLevel = "beginner" | "intermediate" | "advanced";

export type AcademyFrontmatter = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  level: AcademyLevel;
  draft: boolean;
  slug?: string;
};

export type AcademyPostSummary = AcademyFrontmatter & {
  slug: string;
  dateLabel: string;
  dateSort: number;
};

export type AcademyPost = AcademyPostSummary & {
  content: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content/academy");
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const LEVELS: AcademyLevel[] = ["beginner", "intermediate", "advanced"];

function shouldIncludeDrafts(includeDrafts?: boolean) {
  return includeDrafts ?? process.env.NODE_ENV !== "production";
}

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseFrontmatter(
  data: Record<string, unknown>,
  fileName: string
): AcademyFrontmatter {
  const title = typeof data.title === "string" ? data.title.trim() : "";
  if (!title) {
    throw new Error(`Missing title in ${fileName}`);
  }

  const description =
    typeof data.description === "string" ? data.description.trim() : "";
  if (!description) {
    throw new Error(`Missing description in ${fileName}`);
  }

  const date = typeof data.date === "string" ? data.date.trim() : "";
  if (!DATE_PATTERN.test(date)) {
    throw new Error(`Invalid date in ${fileName}. Use YYYY-MM-DD.`);
  }

  const tags = Array.isArray(data.tags)
    ? data.tags
        .map((tag) => String(tag).trim())
        .filter((tag) => tag.length > 0)
    : [];

  const levelRaw = typeof data.level === "string" ? data.level.trim() : "";
  if (!LEVELS.includes(levelRaw as AcademyLevel)) {
    throw new Error(
      `Invalid level in ${fileName}. Use beginner|intermediate|advanced.`
    );
  }

  const draft = Boolean(data.draft);
  const slug = typeof data.slug === "string" ? data.slug.trim() : undefined;

  return {
    title,
    description,
    date,
    tags,
    level: levelRaw as AcademyLevel,
    draft,
    slug,
  };
}

function buildSummary(
  frontmatter: AcademyFrontmatter,
  fileName: string
): AcademyPostSummary {
  const baseSlug = toSlug(frontmatter.slug || fileName);
  const slug = baseSlug || toSlug(fileName);
  const dateSort = Date.parse(`${frontmatter.date}T00:00:00Z`);
  if (Number.isNaN(dateSort)) {
    throw new Error(`Invalid date in ${fileName}. Use YYYY-MM-DD.`);
  }
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(dateSort));

  return {
    ...frontmatter,
    slug,
    dateLabel,
    dateSort,
  };
}

async function getMdxFiles() {
  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".mdx"))
    .map((entry) => entry.name);
}

async function readPostSummary(fileName: string): Promise<AcademyPostSummary> {
  const filePath = path.join(CONTENT_DIR, fileName);
  const raw = await fs.readFile(filePath, "utf8");
  const { data } = matter(raw);
  const frontmatter = parseFrontmatter(
    data as Record<string, unknown>,
    fileName
  );
  return buildSummary(frontmatter, path.parse(fileName).name);
}

async function readPost(fileName: string): Promise<AcademyPost> {
  const filePath = path.join(CONTENT_DIR, fileName);
  const raw = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(raw);
  const frontmatter = parseFrontmatter(
    data as Record<string, unknown>,
    fileName
  );
  const summary = buildSummary(frontmatter, path.parse(fileName).name);
  return { ...summary, content };
}

export async function getAllAcademyPosts(
  includeDrafts?: boolean
): Promise<AcademyPostSummary[]> {
  const files = await getMdxFiles();
  const posts = await Promise.all(files.map((file) => readPostSummary(file)));
  const visible = posts.filter(
    (post) => shouldIncludeDrafts(includeDrafts) || !post.draft
  );
  return visible.sort((a, b) => b.dateSort - a.dateSort);
}

export async function getAcademyPostBySlug(
  slug: string,
  includeDrafts?: boolean
): Promise<AcademyPost | null> {
  const files = await getMdxFiles();
  const include = shouldIncludeDrafts(includeDrafts);

  for (const file of files) {
    const post = await readPost(file);
    if (post.slug !== slug) continue;
    if (!include && post.draft) return null;
    return post;
  }

  return null;
}

export async function getAdjacentPosts(
  slug: string,
  includeDrafts?: boolean
): Promise<{ previous: AcademyPostSummary | null; next: AcademyPostSummary | null }> {
  const posts = await getAllAcademyPosts(includeDrafts);
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) {
    return { previous: null, next: null };
  }

  const previous = index < posts.length - 1 ? posts[index + 1] : null;
  const next = index > 0 ? posts[index - 1] : null;

  return { previous, next };
}
