#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../..");
const QUEUE_PATH = path.join(ROOT_DIR, ".maintenance", "config", "weekly-ui-improvements.json");
const LOG_PATH = path.join(ROOT_DIR, ".maintenance", "IMPROVEMENT_LOG.md");
const REPORTS_DIR = path.join(ROOT_DIR, ".maintenance", "reports");
const PR_BODY_PATH = path.join(REPORTS_DIR, "weekly-ui-improvement-pr.md");

function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const apply = args.has("--apply");
  const now = new Date();

  if (!dryRun && !apply) {
    console.error("Use --apply to write the next improvement or --dry-run to preview it.");
    process.exit(1);
  }

  const queue = readJson(QUEUE_PATH);
  const nextItem = queue.improvements.find((item) => item.status === "ready");

  if (!nextItem) {
    mkdirSync(REPORTS_DIR, { recursive: true });
    writeFileSync(PR_BODY_PATH, renderNoopBody(queue));
    console.log("No ready UI/UX improvements remain in the weekly queue.");
    process.exit(0);
  }

  const recipe = recipes[nextItem.id];

  if (!recipe) {
    console.error(`No implementation recipe exists for ${nextItem.id}.`);
    process.exit(1);
  }

  const summary = {
    acceptance: nextItem.acceptance,
    area: nextItem.area,
    files: recipe.files,
    id: nextItem.id,
    priority: nextItem.priority,
    title: nextItem.title,
    why: nextItem.why,
  };

  if (dryRun) {
    console.log(renderConsolePreview(summary));
    process.exit(0);
  }

  const changes = recipe.apply();
  const appliedAt = now.toISOString();

  nextItem.status = "proposed";
  nextItem.proposedAt = appliedAt;
  nextItem.files = recipe.files;

  writeFileSync(QUEUE_PATH, `${JSON.stringify(queue, null, 2)}\n`);
  appendImprovementLog({ ...summary, appliedAt, changes });
  mkdirSync(REPORTS_DIR, { recursive: true });
  writeFileSync(PR_BODY_PATH, renderPrBody({ ...summary, appliedAt, changes }));

  console.log(`Weekly UI/UX improvement proposed: ${nextItem.title}`);
  console.log(`PR body written to ${path.relative(ROOT_DIR, PR_BODY_PATH)}`);
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function readText(relativePath) {
  return readFileSync(path.join(ROOT_DIR, relativePath), "utf8");
}

function writeText(relativePath, value) {
  writeFileSync(path.join(ROOT_DIR, relativePath), value);
}

function ensureFile(relativePath, content) {
  const absolutePath = path.join(ROOT_DIR, relativePath);
  if (existsSync(absolutePath)) return `${relativePath}: already exists`;
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content);
  return `${relativePath}: created`;
}

function replaceOnce(relativePath, search, replacement) {
  const current = readText(relativePath);
  if (current.includes(replacement)) {
    return `${relativePath}: replacement already present`;
  }

  if (!current.includes(search)) {
    throw new Error(`Could not find expected block in ${relativePath}`);
  }

  writeText(relativePath, current.replace(search, replacement));
  return `${relativePath}: updated`;
}

function insertAfter(relativePath, marker, insertion) {
  const current = readText(relativePath);
  if (current.includes(insertion.trim())) {
    return `${relativePath}: import already present`;
  }

  if (!current.includes(marker)) {
    throw new Error(`Could not find marker in ${relativePath}`);
  }

  writeText(relativePath, current.replace(marker, `${marker}${insertion}`));
  return `${relativePath}: import added`;
}

function appendImprovementLog(entry) {
  const lines = [
    "",
    `## ${entry.appliedAt.slice(0, 10)} - ${entry.title}`,
    "",
    `Priority: ${entry.priority}`,
    `Area: ${entry.area}`,
    "",
    `Design reason: ${entry.why}`,
    "",
    "Files:",
    ...entry.files.map((file) => `- ${file}`),
    "",
    "Acceptance:",
    ...entry.acceptance.map((item) => `- ${item}`),
    "",
    "Applied changes:",
    ...entry.changes.map((item) => `- ${item}`),
    "",
  ];

  writeFileSync(LOG_PATH, `${readFileSync(LOG_PATH, "utf8").trimEnd()}\n${lines.join("\n")}`);
}

function renderConsolePreview(entry) {
  return [
    `Next weekly UI/UX PR: ${entry.title}`,
    `Priority: ${entry.priority}`,
    `Area: ${entry.area}`,
    `Why: ${entry.why}`,
    "Files:",
    ...entry.files.map((file) => `- ${file}`),
  ].join("\n");
}

function renderPrBody(entry) {
  return [
    "## Weekly UI/UX Improvement",
    "",
    `**Focus:** ${entry.area}`,
    `**Priority:** ${entry.priority}`,
    "",
    "### Design Intent",
    "",
    entry.why,
    "",
    "### Changes",
    "",
    ...entry.changes.map((item) => `- ${item}`),
    "",
    "### Acceptance Criteria",
    "",
    ...entry.acceptance.map((item) => `- [ ] ${item}`),
    "",
    "### Validation",
    "",
    "- [ ] `npm run lint`",
    "- [ ] `npm run build`",
    "- [ ] Review desktop and mobile UI screenshots",
    "- [ ] Check copy, focus states, overflow, and empty/loading/error states",
    "",
    "This PR was generated as a small weekly design/product improvement. It should be reviewed by a human before merge.",
    "",
  ].join("\n");
}

function renderNoopBody(queue) {
  return [
    "## Weekly UI/UX Improvement",
    "",
    "No ready improvement recipe remains in the queue.",
    "",
    "Add new items to `.maintenance/config/weekly-ui-improvements.json` with status `ready`.",
    "",
    "Current focus areas:",
    ...queue.focus.map((item) => `- ${item}`),
    "",
  ].join("\n");
}

const emptyStateComponent = String.raw`import Link from "next/link";
import type { ReactNode } from "react";

type EmptyStateProps = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  icon?: ReactNode;
  title: string;
};

export function EmptyState({
  actionHref,
  actionLabel,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/20 p-8 text-center sm:p-12">
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-accent">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--foreground-muted)]">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="ui-button ui-button--primary mt-6">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
`;

const agentsEmptyStateSearch = String.raw`          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border p-12 text-center">
            <p className="font-medium text-foreground">No agents configured</p>
            <p className="mt-2 max-w-sm text-sm text-[var(--foreground-muted)]">
              Create your first agent to connect store data and start replying
              to chats automatically.
            </p>
            <Link
              href="/dashboard/agents"
              className="ui-button ui-button--primary mt-6"
            >
              Create agent
            </Link>
          </div>`;

const agentsEmptyStateReplacement = String.raw`          <EmptyState
            title="No agents configured"
            description="Create your first agent to connect store data and start replying to chats automatically."
            actionHref="/dashboard/agents"
            actionLabel="Create agent"
          />`;

const recipes = {
  "dashboard-empty-state-system": {
    files: [
      "components/ui/EmptyState.tsx",
      "app/dashboard/AgentsSection.tsx",
    ],
    apply() {
      return [
        ensureFile("components/ui/EmptyState.tsx", emptyStateComponent),
        insertAfter(
          "app/dashboard/AgentsSection.tsx",
          `import Link from "next/link";\n`,
          `import { EmptyState } from "@/components/ui/EmptyState";\n`,
        ),
        replaceOnce(
          "app/dashboard/AgentsSection.tsx",
          agentsEmptyStateSearch,
          agentsEmptyStateReplacement,
        ),
      ];
    },
  },
  "integration-empty-state-cta": {
    files: ["app/dashboard/integrations/page.tsx"],
    apply() {
      const search = String.raw`        <div
          className="mt-6 rounded-xl border border-dashed border-border/60 bg-surface/30 p-6 text-center text-sm text-[var(--foreground-muted)]"
          data-oid="pyivl2c"
        >
          No connections yet. Add your first store to start syncing data.
        </div>`;
      const replacement = String.raw`        <div
          className="mt-6 rounded-xl border border-dashed border-border/60 bg-surface/30 p-6 text-center"
          data-oid="pyivl2c"
        >
          <p className="text-sm font-medium text-foreground">
            No {title} connection yet
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--foreground-muted)]">
            Add your first store to start syncing products and make agent answers more useful.
          </p>
          <Link href={href} className="ui-button ui-button--ghost mt-5 text-xs">
            Connect {title}
          </Link>
        </div>`;
      return [replaceOnce("app/dashboard/integrations/page.tsx", search, replacement)];
    },
  },
  "button-mobile-stability": {
    files: ["app/globals.css"],
    apply() {
      const search = String.raw`.ui-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--pill-radius);
  font-weight: 500;
  font-size: 0.925rem;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
  border: 1px solid transparent;
}`;
      const replacement = String.raw`.ui-button {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: var(--pill-radius);
  font-weight: 500;
  font-size: 0.925rem;
  line-height: 1;
  padding: 10px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 200ms cubic-bezier(0.2, 0.8, 0.2, 1);
  border: 1px solid transparent;
}

.ui-button > svg {
  flex: 0 0 auto;
}

.ui-button > span {
  min-width: 0;
}`;
      return [replaceOnce("app/globals.css", search, replacement)];
    },
  },
};

main();
