#!/usr/bin/env node

import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../..");

const CONFIG_RELATIVE_PATH =
  ".maintenance/config/weekly-ui-improvements.json";
const LOG_RELATIVE_PATH = ".maintenance/IMPROVEMENT_LOG.md";
const PR_BODY_RELATIVE_PATH =
  ".maintenance/reports/weekly-ui-improvement-pr.md";

// These are hard safety boundaries. Configuration may make them stricter, but
// it cannot widen them without a reviewed change to this execution engine.
const HARD_ALLOWED_ROOTS = ["app/", "components/"];
const HARD_ALLOWED_EXTENSIONS = new Set([".css", ".mdx", ".tsx"]);
const HARD_BLOCKED_PREFIXES = [
  "app/api/",
  "app/auth/",
  "app/dashboard/billing/",
  "app/integrations/",
  "app/login/",
  "app/pricing/",
  "app/signup/",
];
const HARD_BLOCKED_PATHS = new Set([
  "app/dashboard/agents/[id]/RotateApiKeyButton.tsx",
  "components/Navbar.tsx",
  "components/PayPalButton.tsx",
  "components/PricingCards.tsx",
  "components/SignOut.tsx",
]);
const PROTECTED_FILE_PATTERNS = [
  /(?:from|import\s*\()["']@\/lib\/(?:auth|crypto|paypal|supabase)/i,
  /@paypal\/react-paypal-js/i,
  /\bprocess\.env\b/,
  /\bsupabase\b/i,
  /\bapi[_-]?key\b/i,
  /\b(?:requireUser|signIn|signOut)\s*\(/,
  /^[ \t]*["']use server["'];?/m,
];
const BLOCKED_ADDITION_PATTERNS = [
  /(?:from|import\s*\()["']@\/lib\/(?:auth|crypto|paypal|supabase)/i,
  /@paypal\/react-paypal-js/i,
  /(?:from|import\s*\()["']node:/i,
  /\b(?:eval|Function)\s*\(/,
  /\bchild_process\b/,
  /\bdangerouslySetInnerHTML\b/,
  /\bdocument\.cookie\b/,
  /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/,
  /\bprocess\.env\b/,
  /\bsupabase\b/i,
  /\bapi[_-]?key\b/i,
  /https?:\/\//i,
  /["']use server["']/i,
];
const PRIORITY_FALLBACK = ["P0", "P1", "P2", "P3"];
const VALID_STATUSES = new Set(["ready", "proposed", "paused"]);
const VALID_OPERATION_TYPES = new Set(["create_file", "replace_text"]);

export function main({
  args = process.argv.slice(2),
  env = process.env,
  now = new Date(),
  rootDir = ROOT_DIR,
  verifyClean = true,
} = {}) {
  const mode = parseMode(args);
  const configPath = resolveInsideRoot(rootDir, CONFIG_RELATIVE_PATH);
  const config = validateConfig(readJson(configPath));
  const queueDirectory = resolveInsideRoot(rootDir, config.queueDirectory);
  const candidates = loadQueue(queueDirectory, config);
  const next = selectNextImprovement(candidates, config);

  if (!next) {
    writeGithubOutput(env, "applied", "false");
    writeGithubOutput(env, "reason", "queue-empty");
    console.log(
      `No ready UI/UX improvement is available in ${config.queueDirectory}.`,
    );
    return { applied: false, reason: "queue-empty" };
  }

  const prepared = prepareImprovement({
    config,
    improvement: next.improvement,
    rootDir,
    verifyClean,
  });
  const summary = buildSummary(next, prepared);

  if (mode === "dry-run") {
    writeGithubOutput(env, "applied", "false");
    writeGithubOutput(env, "reason", "dry-run");
    console.log(renderConsolePreview(summary));
    return { applied: false, reason: "dry-run", summary };
  }

  const appliedAt = now.toISOString();
  const updatedManifest = {
    ...next.improvement,
    status: "proposed",
    proposedAt: appliedAt,
    files: prepared.files,
  };
  const logPath = resolveInsideRoot(rootDir, LOG_RELATIVE_PATH);
  const prBodyPath = resolveInsideRoot(rootDir, PR_BODY_RELATIVE_PATH);
  const writes = new Map(prepared.contents);

  writes.set(next.manifestPath, `${JSON.stringify(updatedManifest, null, 2)}\n`);
  writes.set(logPath, renderUpdatedLog(logPath, { ...summary, appliedAt }));
  writes.set(prBodyPath, renderPrBody({ ...summary, appliedAt }));

  commitWrites(writes);
  writeGithubOutput(env, "applied", "true");
  writeGithubOutput(env, "improvement_id", summary.id);
  writeGithubOutput(env, "pr_title", `Weekly UI/UX: ${summary.title}`);
  writeGithubOutput(
    env,
    "expected_paths",
    JSON.stringify([
      ...summary.files,
      toRepoPath(rootDir, next.manifestPath),
      LOG_RELATIVE_PATH,
      PR_BODY_RELATIVE_PATH,
    ]),
  );

  console.log(`Weekly UI/UX improvement applied: ${summary.title}`);
  console.log(`Manifest: ${toRepoPath(rootDir, next.manifestPath)}`);
  console.log(`PR body: ${PR_BODY_RELATIVE_PATH}`);

  return { applied: true, summary };
}

function parseMode(args) {
  const flags = new Set(args);
  const apply = flags.has("--apply");
  const dryRun = flags.has("--dry-run");

  if (flags.has("--help")) {
    console.log(
      "Usage: node .maintenance/scripts/weekly-ui-improvement.mjs --apply|--dry-run",
    );
    process.exit(0);
  }

  if (apply === dryRun || flags.size !== 1) {
    throw new Error("Use exactly one of --apply or --dry-run.");
  }

  return apply ? "apply" : "dry-run";
}

export function validateConfig(config) {
  assertObject(config, "weekly UI/UX configuration");
  assertOnlyKeys(
    config,
    [
      "cadence",
      "focus",
      "mode",
      "policy",
      "queueDirectory",
      "schemaVersion",
      "selection",
    ],
    "weekly UI/UX configuration",
  );

  if (config.schemaVersion !== 2) {
    throw new Error("weekly UI/UX configuration must use schemaVersion 2.");
  }

  assertNonEmptyString(config.queueDirectory, "queueDirectory");
  const queueDirectory = normalizeRepoPath(config.queueDirectory);
  if (!queueDirectory.startsWith(".maintenance/improvements/")) {
    throw new Error(
      "queueDirectory must stay inside .maintenance/improvements/.",
    );
  }
  assertStringArray(config.focus, "focus", { min: 1, max: 12 });
  assertObject(config.selection, "selection");
  assertOnlyKeys(config.selection, ["priorities", "strategy"], "selection");
  if (config.selection.strategy !== "priority-then-oldest") {
    throw new Error('selection.strategy must be "priority-then-oldest".');
  }
  assertStringArray(config.selection.priorities, "selection.priorities", {
    min: 1,
    max: 10,
  });

  const policy = config.policy;
  assertObject(policy, "policy");
  assertOnlyKeys(
    policy,
    [
      "allowedCategories",
      "allowedExtensions",
      "allowedPathPrefixes",
      "blockedPathPrefixes",
      "blockedPaths",
      "maxChangedLines",
      "maxFileBytes",
      "maxFiles",
      "maxOperations",
    ],
    "policy",
  );
  assertStringArray(policy.allowedCategories, "policy.allowedCategories", {
    min: 1,
    max: 20,
  });
  assertStringArray(policy.allowedExtensions, "policy.allowedExtensions", {
    min: 1,
    max: 12,
  });
  assertStringArray(policy.allowedPathPrefixes, "policy.allowedPathPrefixes", {
    min: 1,
    max: 12,
  });
  assertStringArray(policy.blockedPathPrefixes, "policy.blockedPathPrefixes", {
    min: 0,
    max: 30,
  });
  assertStringArray(policy.blockedPaths, "policy.blockedPaths", {
    min: 0,
    max: 30,
  });
  assertIntegerBetween(policy.maxFiles, "policy.maxFiles", 1, 5);
  assertIntegerBetween(policy.maxOperations, "policy.maxOperations", 1, 12);
  assertIntegerBetween(policy.maxChangedLines, "policy.maxChangedLines", 1, 250);
  assertIntegerBetween(policy.maxFileBytes, "policy.maxFileBytes", 1, 1_000_000);

  for (const prefix of policy.allowedPathPrefixes) {
    const normalized = normalizeRepoPath(prefix);
    if (!normalized.endsWith("/")) {
      throw new Error(`Allowed path prefix must end in /: ${prefix}`);
    }
    if (!HARD_ALLOWED_ROOTS.some((root) => normalized.startsWith(root))) {
      throw new Error(`Configuration cannot allow path prefix: ${prefix}`);
    }
  }
  for (const extension of policy.allowedExtensions) {
    if (!HARD_ALLOWED_EXTENSIONS.has(extension)) {
      throw new Error(`Configuration cannot allow extension: ${extension}`);
    }
  }

  return config;
}

function loadQueue(queueDirectory, config) {
  if (!existsSync(queueDirectory)) {
    throw new Error(`Queue directory does not exist: ${queueDirectory}`);
  }

  const entries = readdirSync(queueDirectory, { withFileTypes: true });
  const manifests = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((entry) => {
      const manifestPath = path.join(queueDirectory, entry.name);
      return {
        improvement: validateImprovement(readJson(manifestPath), config, entry.name),
        manifestPath,
      };
    });

  const ids = new Set();
  for (const { improvement } of manifests) {
    if (ids.has(improvement.id)) {
      throw new Error(`Duplicate improvement id in queue: ${improvement.id}`);
    }
    ids.add(improvement.id);
  }

  return manifests;
}

export function validateImprovement(improvement, config, source = "manifest") {
  assertObject(improvement, source);
  assertOnlyKeys(
    improvement,
    [
      "$schema",
      "acceptance",
      "area",
      "category",
      "createdAt",
      "files",
      "id",
      "operations",
      "priority",
      "problem",
      "proposedAt",
      "solution",
      "status",
      "title",
    ],
    source,
  );
  assertNonEmptyString(improvement.id, `${source}.id`);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(improvement.id)) {
    throw new Error(`${source}.id must be a lowercase kebab-case identifier.`);
  }
  if (!VALID_STATUSES.has(improvement.status)) {
    throw new Error(`${source}.status must be ready, proposed, or paused.`);
  }
  if (!config.selection.priorities.includes(improvement.priority)) {
    throw new Error(`${source}.priority is not configured: ${improvement.priority}`);
  }
  if (!config.policy.allowedCategories.includes(improvement.category)) {
    throw new Error(`${source}.category is not allowed: ${improvement.category}`);
  }
  for (const field of ["area", "problem", "solution", "title"]) {
    assertNonEmptyString(improvement[field], `${source}.${field}`);
  }
  assertIsoDate(improvement.createdAt, `${source}.createdAt`);
  assertStringArray(improvement.acceptance, `${source}.acceptance`, {
    min: 1,
    max: 8,
  });
  if (!Array.isArray(improvement.operations) || improvement.operations.length < 1) {
    throw new Error(`${source}.operations must contain at least one operation.`);
  }
  if (improvement.operations.length > config.policy.maxOperations) {
    throw new Error(
      `${source} exceeds the ${config.policy.maxOperations}-operation limit.`,
    );
  }

  improvement.operations.forEach((operation, index) => {
    validateOperation(operation, `${source}.operations[${index}]`);
  });

  if (improvement.status === "proposed") {
    assertIsoDate(improvement.proposedAt, `${source}.proposedAt`);
    assertStringArray(improvement.files, `${source}.files`, { min: 1, max: 5 });
  }

  return improvement;
}

function validateOperation(operation, label) {
  assertObject(operation, label);
  assertOnlyKeys(
    operation,
    [
      "after",
      "before",
      "content",
      "description",
      "expectedOccurrences",
      "path",
      "type",
    ],
    label,
  );
  if (!VALID_OPERATION_TYPES.has(operation.type)) {
    throw new Error(`${label}.type must be create_file or replace_text.`);
  }
  assertNonEmptyString(operation.path, `${label}.path`);
  assertNonEmptyString(operation.description, `${label}.description`);

  if (operation.type === "create_file") {
    if (typeof operation.content !== "string" || operation.content.length === 0) {
      throw new Error(`${label}.content must be a non-empty string.`);
    }
    assertOnlyDefined(operation, ["content", "description", "path", "type"], label);
    return;
  }

  assertNonEmptyString(operation.before, `${label}.before`);
  if (typeof operation.after !== "string") {
    throw new Error(`${label}.after must be a string.`);
  }
  assertIntegerBetween(
    operation.expectedOccurrences,
    `${label}.expectedOccurrences`,
    1,
    5,
  );
  if (operation.before === operation.after) {
    throw new Error(`${label} does not change any text.`);
  }
  assertOnlyDefined(
    operation,
    ["after", "before", "description", "expectedOccurrences", "path", "type"],
    label,
  );
}

export function selectNextImprovement(candidates, config) {
  const priorities = config.selection?.priorities ?? PRIORITY_FALLBACK;
  const priorityIndex = new Map(
    priorities.map((priority, index) => [priority, index]),
  );

  return candidates
    .filter(({ improvement }) => improvement.status === "ready")
    .sort((left, right) => {
      const priorityDifference =
        (priorityIndex.get(left.improvement.priority) ?? priorities.length) -
        (priorityIndex.get(right.improvement.priority) ?? priorities.length);
      if (priorityDifference !== 0) return priorityDifference;
      const dateDifference = left.improvement.createdAt.localeCompare(
        right.improvement.createdAt,
      );
      if (dateDifference !== 0) return dateDifference;
      return left.improvement.id.localeCompare(right.improvement.id);
    })[0];
}

export function prepareImprovement({
  config,
  improvement,
  rootDir,
  verifyClean = true,
}) {
  const contents = new Map();
  const originals = new Map();
  const files = [];
  let changedLines = 0;

  for (const operation of improvement.operations) {
    const relativePath = assertPathAllowed(operation.path, config.policy);
    const absolutePath = resolveInsideRoot(rootDir, relativePath);

    if (!files.includes(relativePath)) files.push(relativePath);
    if (!originals.has(absolutePath)) {
      const exists = existsSync(absolutePath);
      if (exists && !statSync(absolutePath).isFile()) {
        throw new Error(`Improvement target is not a regular file: ${relativePath}`);
      }
      const original = exists ? readFileSync(absolutePath, "utf8") : null;
      if (original?.includes("\0")) {
        throw new Error(`Binary files are not supported: ${relativePath}`);
      }
      if (original && PROTECTED_FILE_PATTERNS.some((pattern) => pattern.test(original))) {
        throw new Error(
          `Protected auth, payment, data, or server logic detected in ${relativePath}.`,
        );
      }
      originals.set(absolutePath, original);
      contents.set(absolutePath, original);
    }

    if (operation.type === "create_file") {
      if (contents.get(absolutePath) !== null) {
        throw new Error(`create_file target already exists: ${relativePath}`);
      }
      assertSafeAddition(operation.content, relativePath);
      contents.set(absolutePath, ensureFinalNewline(operation.content));
      changedLines += countLines(operation.content);
      continue;
    }

    const current = contents.get(absolutePath);
    if (current === null) {
      throw new Error(`replace_text target does not exist: ${relativePath}`);
    }
    const occurrences = countOccurrences(current, operation.before);
    if (occurrences !== operation.expectedOccurrences) {
      throw new Error(
        `${relativePath}: expected ${operation.expectedOccurrences} occurrence(s), found ${occurrences}.`,
      );
    }
    assertSafeAddition(operation.after, relativePath);
    contents.set(absolutePath, current.split(operation.before).join(operation.after));
    changedLines +=
      operation.expectedOccurrences *
      (countLines(operation.before) + countLines(operation.after));
  }

  if (files.length > config.policy.maxFiles) {
    throw new Error(`Improvement exceeds the ${config.policy.maxFiles}-file limit.`);
  }
  if (changedLines > config.policy.maxChangedLines) {
    throw new Error(
      `Improvement touches ${changedLines} lines; limit is ${config.policy.maxChangedLines}.`,
    );
  }

  for (const [absolutePath, content] of contents) {
    if (content === originals.get(absolutePath)) {
      throw new Error(`Operation produced no change in ${toRepoPath(rootDir, absolutePath)}.`);
    }
    if (Buffer.byteLength(content, "utf8") > config.policy.maxFileBytes) {
      throw new Error(
        `${toRepoPath(rootDir, absolutePath)} exceeds the configured file-size limit.`,
      );
    }
  }

  if (verifyClean) assertTargetsClean(rootDir, files);

  return {
    changedLines,
    contents,
    files: files.sort(),
  };
}

export function assertPathAllowed(candidate, policy) {
  const relativePath = normalizeRepoPath(candidate);
  const extension = path.posix.extname(relativePath);
  const configuredAllowed = policy.allowedPathPrefixes.some((prefix) =>
    relativePath.startsWith(prefix),
  );
  const hardAllowed = HARD_ALLOWED_ROOTS.some((prefix) =>
    relativePath.startsWith(prefix),
  );
  const blocked = [
    ...HARD_BLOCKED_PREFIXES,
    ...policy.blockedPathPrefixes,
  ].some((prefix) => relativePath.startsWith(prefix));

  if (!hardAllowed || !configuredAllowed) {
    throw new Error(`Improvement path is outside allowed UI roots: ${candidate}`);
  }
  if (
    blocked ||
    HARD_BLOCKED_PATHS.has(relativePath) ||
    policy.blockedPaths.includes(relativePath)
  ) {
    throw new Error(`Improvement path is protected: ${candidate}`);
  }
  if (
    !HARD_ALLOWED_EXTENSIONS.has(extension) ||
    !policy.allowedExtensions.includes(extension)
  ) {
    throw new Error(`Improvement file type is not allowed: ${candidate}`);
  }

  return relativePath;
}

function normalizeRepoPath(candidate) {
  if (typeof candidate !== "string" || candidate.length === 0) {
    throw new Error("Repository path must be a non-empty string.");
  }
  if (candidate.includes("\\") || path.posix.isAbsolute(candidate)) {
    throw new Error(`Repository path must be relative and use /: ${candidate}`);
  }
  if (!/^[A-Za-z0-9._/\[\]-]+$/.test(candidate)) {
    throw new Error(`Repository path contains unsupported characters: ${candidate}`);
  }
  const normalized = path.posix.normalize(candidate);
  if (
    normalized !== candidate ||
    normalized === "." ||
    normalized.startsWith("../") ||
    normalized.includes("/../")
  ) {
    throw new Error(`Unsafe repository path: ${candidate}`);
  }
  return normalized;
}

function resolveInsideRoot(rootDir, relativePath) {
  const normalized = normalizeRepoPath(relativePath);
  const resolvedRoot = path.resolve(rootDir);
  const resolved = path.resolve(resolvedRoot, ...normalized.split("/"));
  if (resolved !== resolvedRoot && !resolved.startsWith(`${resolvedRoot}${path.sep}`)) {
    throw new Error(`Path escapes repository root: ${relativePath}`);
  }
  return resolved;
}

function assertSafeAddition(content, relativePath) {
  if (content.includes("\0")) {
    throw new Error(`NUL bytes are not allowed in ${relativePath}.`);
  }
  const blockedPattern = BLOCKED_ADDITION_PATTERNS.find((pattern) =>
    pattern.test(content),
  );
  if (blockedPattern) {
    throw new Error(`Potentially unsafe code addition rejected in ${relativePath}.`);
  }
}

function assertTargetsClean(rootDir, files) {
  const result = spawnSync("git", ["status", "--porcelain", "--", ...files], {
    cwd: rootDir,
    encoding: "utf8",
    shell: false,
  });
  if (result.status !== 0) {
    throw new Error(`Could not verify clean targets with git: ${result.stderr.trim()}`);
  }
  if (result.stdout.trim()) {
    throw new Error(
      `Refusing to modify targets with existing changes:\n${result.stdout.trim()}`,
    );
  }
}

function buildSummary(next, prepared) {
  return {
    acceptance: next.improvement.acceptance,
    area: next.improvement.area,
    category: next.improvement.category,
    changedLines: prepared.changedLines,
    changes: next.improvement.operations.map(
      (operation) => operation.description,
    ),
    files: prepared.files,
    id: next.improvement.id,
    priority: next.improvement.priority,
    problem: next.improvement.problem,
    solution: next.improvement.solution,
    title: next.improvement.title,
  };
}

function renderConsolePreview(entry) {
  return [
    `Next weekly UI/UX improvement: ${entry.title}`,
    `ID: ${entry.id}`,
    `Priority: ${entry.priority}`,
    `Area: ${entry.area}`,
    `Category: ${entry.category}`,
    `Problem: ${entry.problem}`,
    `Solution: ${entry.solution}`,
    `Estimated touched lines: ${entry.changedLines}`,
    "Files:",
    ...entry.files.map((file) => `- ${file}`),
  ].join("\n");
}

function renderPrBody(entry) {
  return [
    "## Weekly UI/UX Improvement",
    "",
    `**Improvement:** \`${entry.id}\``,
    `**Focus:** ${entry.area}`,
    `**Category:** ${entry.category}`,
    `**Priority:** ${entry.priority}`,
    "",
    "### Problem detected",
    "",
    entry.problem,
    "",
    "### Solution applied",
    "",
    entry.solution,
    "",
    "### Files modified",
    "",
    ...entry.files.map((file) => `- \`${file}\``),
    "",
    "### Change details",
    "",
    ...entry.changes.map((item) => `- ${item}`),
    "",
    "### Acceptance criteria",
    "",
    ...entry.acceptance.map((item) => `- [ ] ${item}`),
    "",
    "### Validation planned",
    "",
    "- `npm ci`",
    "- `npm run lint`",
    "- `npm run build`",
    "- Human review on desktop and mobile",
    "",
    "Validation outcomes are appended by GitHub Actions after every command has run.",
    "",
    "> This automation never merges changes. This draft requires human review before merge.",
    "",
  ].join("\n");
}

function renderUpdatedLog(logPath, entry) {
  const current = existsSync(logPath)
    ? readFileSync(logPath, "utf8").trimEnd()
    : "# Weekly UI/UX Improvement Log";
  const addition = [
    "",
    "",
    `## ${entry.appliedAt.slice(0, 10)} - ${entry.title}`,
    "",
    `ID: ${entry.id}`,
    `Priority: ${entry.priority}`,
    `Area: ${entry.area}`,
    `Category: ${entry.category}`,
    "",
    `Problem: ${entry.problem}`,
    "",
    `Solution: ${entry.solution}`,
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
    "Validation: Pending GitHub Actions (`npm ci`, lint, build).",
    "",
  ].join("\n");
  return `${current}${addition}`;
}

function commitWrites(writes) {
  const backups = new Map();
  const completed = [];

  try {
    for (const [filePath, content] of writes) {
      backups.set(filePath, existsSync(filePath) ? readFileSync(filePath) : null);
      mkdirSync(path.dirname(filePath), { recursive: true });
      const temporaryPath = `${filePath}.weekly-ui-${process.pid}.tmp`;
      writeFileSync(temporaryPath, content);
      renameSync(temporaryPath, filePath);
      completed.push(filePath);
    }
  } catch (error) {
    for (const filePath of completed.reverse()) {
      const backup = backups.get(filePath);
      if (backup === null) rmSync(filePath, { force: true });
      else writeFileSync(filePath, backup);
    }
    throw error;
  }
}

function writeGithubOutput(env, key, value) {
  if (!env.GITHUB_OUTPUT) return;
  appendFileSync(env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(`Could not read JSON ${filePath}: ${error.message}`);
  }
}

function readDefinedKeys(value) {
  return Object.keys(value).filter((key) => value[key] !== undefined);
}

function assertOnlyKeys(value, allowed, label) {
  const unexpected = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unexpected.length) {
    throw new Error(`${label} has unsupported key(s): ${unexpected.join(", ")}`);
  }
}

function assertOnlyDefined(value, allowed, label) {
  const unexpected = readDefinedKeys(value).filter((key) => !allowed.includes(key));
  if (unexpected.length) {
    throw new Error(`${label} has incompatible key(s): ${unexpected.join(", ")}`);
  }
}

function assertObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  if (value.includes("\n") && label.endsWith(".title")) {
    throw new Error(`${label} must fit on one line.`);
  }
}

function assertStringArray(value, label, { min, max }) {
  if (
    !Array.isArray(value) ||
    value.length < min ||
    value.length > max ||
    value.some((item) => typeof item !== "string" || item.trim().length === 0)
  ) {
    throw new Error(`${label} must contain ${min}-${max} non-empty strings.`);
  }
}

function assertIntegerBetween(value, label, min, max) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${label} must be an integer between ${min} and ${max}.`);
  }
}

function assertIsoDate(value, label) {
  assertNonEmptyString(value, label);
  if (Number.isNaN(Date.parse(value)) || new Date(value).toISOString() !== value) {
    throw new Error(`${label} must be an ISO-8601 UTC timestamp.`);
  }
}

function countOccurrences(value, search) {
  let count = 0;
  let offset = 0;
  while ((offset = value.indexOf(search, offset)) !== -1) {
    count += 1;
    offset += search.length;
  }
  return count;
}

function countLines(value) {
  if (value.length === 0) return 0;
  return value.split("\n").length;
}

function ensureFinalNewline(value) {
  return value.endsWith("\n") ? value : `${value}\n`;
}

function toRepoPath(rootDir, absolutePath) {
  return path.relative(rootDir, absolutePath).split(path.sep).join("/");
}

const isEntrypoint =
  process.argv[1] &&
  pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isEntrypoint) {
  try {
    main();
  } catch (error) {
    console.error(`Weekly UI/UX improvement failed: ${error.message}`);
    process.exitCode = 1;
  }
}
