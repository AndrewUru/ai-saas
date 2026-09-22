import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { stageCandidate, validateCandidate } from "./weekly-ui-proposal.mjs";

const config = {
  schemaVersion: 2,
  cadence: "weekly",
  mode: "create-reviewable-draft-pr",
  queueDirectory: ".maintenance/improvements/queue",
  focus: ["accessibility"],
  selection: { strategy: "priority-then-oldest", priorities: ["P1", "P2"] },
  policy: {
    allowedCategories: ["accessibility"],
    allowedPathPrefixes: ["app/", "components/"],
    allowedExtensions: [".css", ".mdx", ".tsx"],
    blockedPathPrefixes: [],
    blockedPaths: [],
    maxFiles: 3,
    maxOperations: 6,
    maxChangedLines: 160,
    maxFileBytes: 500000,
  },
};

function withRoot(callback) {
  const rootDir = mkdtempSync(path.join(tmpdir(), "weekly-ui-proposal-"));
  try {
    for (const directory of [".maintenance/config", ".maintenance/improvements/queue", "components"]) {
      mkdirSync(path.join(rootDir, directory), { recursive: true });
    }
    writeFileSync(path.join(rootDir, ".maintenance/config/weekly-ui-improvements.json"), JSON.stringify(config));
    writeFileSync(path.join(rootDir, "components/Status.tsx"), 'export const Status = () => <p>Ready</p>;\n');
    callback(rootDir);
  } finally {
    rmSync(rootDir, { recursive: true, force: true });
  }
}

function candidate(pathName = "components/Status.tsx") {
  return {
    id: "accessible-status",
    status: "ready",
    priority: "P1",
    area: "Dashboard",
    category: "accessibility",
    title: "Announce status",
    problem: "The status is not announced.",
    solution: "Add a status role.",
    acceptance: ["The status is announced."],
    createdAt: "2026-09-21T00:00:00.000Z",
    operations: [{
      type: "replace_text",
      path: pathName,
      description: "Add an accessible role.",
      expectedOccurrences: 1,
      before: "<p>Ready</p>",
      after: '<p role="status">Ready</p>',
    }],
  };
}

test("validates and stages only a safe, applicable Codex proposal", () => withRoot((rootDir) => {
  const candidatePath = path.join(rootDir, "candidate.json");
  const outputPath = path.join(rootDir, "output.txt");
  writeFileSync(candidatePath, JSON.stringify(candidate()));

  const result = validateCandidate({ candidatePath, rootDir, verifyClean: false });
  assert.deepEqual(result.prepared.files, ["components/Status.tsx"]);
  assert.equal(readFileSync(path.join(rootDir, "components/Status.tsx"), "utf8"), 'export const Status = () => <p>Ready</p>;\n');

  stageCandidate({ candidatePath, rootDir, env: { GITHUB_OUTPUT: outputPath }, verifyClean: false });
  assert.match(readFileSync(outputPath, "utf8"), /generated=true/);
  assert.equal(JSON.parse(readFileSync(result.manifestPath, "utf8")).status, "ready");
  assert.throws(() => validateCandidate({ candidatePath, rootDir, verifyClean: false }), /already exists/);
}));

test("rejects stale and protected proposals before staging", () => withRoot((rootDir) => {
  const candidatePath = path.join(rootDir, "candidate.json");
  const stale = candidate();
  stale.operations[0].before = "<p>Old</p>";
  writeFileSync(candidatePath, JSON.stringify(stale));
  assert.throws(() => validateCandidate({ candidatePath, rootDir, verifyClean: false }), /found 0/);

  writeFileSync(candidatePath, JSON.stringify(candidate("app/api/agents/route.tsx")));
  assert.throws(() => validateCandidate({ candidatePath, rootDir, verifyClean: false }), /protected/);
}));

test("accepts an explicit no-improvement result", () => withRoot((rootDir) => {
  const candidatePath = path.join(rootDir, "candidate.json");
  writeFileSync(candidatePath, JSON.stringify({ noImprovement: "No safe change found." }));
  assert.deepEqual(validateCandidate({ candidatePath, rootDir }), {
    generated: false,
    reason: "No safe change found.",
  });
}));
