import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  assertPathAllowed,
  main,
  prepareImprovement,
  selectNextImprovement,
  validateConfig,
} from "./weekly-ui-improvement.mjs";

const policy = {
  allowedPathPrefixes: ["app/", "components/"],
  allowedExtensions: [".css", ".mdx", ".tsx"],
  blockedPathPrefixes: [],
  blockedPaths: [],
  maxFiles: 3,
  maxOperations: 6,
  maxChangedLines: 160,
  maxFileBytes: 500000,
};

test("selects one ready improvement by priority and age", () => {
  const candidates = [
    candidate("new-p1", "P1", "2026-08-20T00:00:00.000Z"),
    candidate("old-p2", "P2", "2026-01-01T00:00:00.000Z"),
    candidate("old-p1", "P1", "2026-08-10T00:00:00.000Z"),
    candidate("paused-p1", "P1", "2026-01-01T00:00:00.000Z", "paused"),
  ];

  const selected = selectNextImprovement(candidates, {
    selection: { priorities: ["P1", "P2"] },
  });

  assert.equal(selected.improvement.id, "old-p1");
});

test("prepares exact replacements in memory without writing the target", () => {
  withTemporaryRoot((rootDir) => {
    const target = path.join(rootDir, "components", "Notice.tsx");
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, "export const label = \"Before\";\n");

    const prepared = prepareImprovement({
      config: { policy },
      improvement: {
        operations: [
          {
            type: "replace_text",
            path: "components/Notice.tsx",
            description: "Improve the label.",
            expectedOccurrences: 1,
            before: "Before",
            after: "After",
          },
        ],
      },
      rootDir,
      verifyClean: false,
    });

    assert.equal(prepared.files[0], "components/Notice.tsx");
    assert.equal(prepared.contents.get(target), 'export const label = "After";\n');
    assert.equal(readFileSync(target, "utf8"), 'export const label = "Before";\n');
  });
});

test("rejects protected and escaping paths", () => {
  assert.throws(
    () => assertPathAllowed("app/api/agents/route.ts", policy),
    /protected/,
  );
  assert.throws(
    () => assertPathAllowed("../package.json", policy),
    /Unsafe repository path/,
  );
  assert.throws(
    () => assertPathAllowed("supabase/migration.sql", policy),
    /outside allowed UI roots/,
  );
});

test("keeps the queue inside the maintenance proposal area", () => {
  assert.throws(
    () =>
      validateConfig({
        schemaVersion: 2,
        cadence: "weekly",
        mode: "create-reviewable-draft-pr",
        queueDirectory: "app/proposals",
        focus: ["accessibility"],
        selection: {
          strategy: "priority-then-oldest",
          priorities: ["P1", "P2"],
        },
        policy: {
          ...policy,
          allowedCategories: ["accessibility"],
        },
      }),
    /must stay inside \.maintenance\/improvements/,
  );
});

test("rejects stale replacements instead of applying an ambiguous change", () => {
  withTemporaryRoot((rootDir) => {
    const target = path.join(rootDir, "app", "page.tsx");
    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, "const label = \"Current\";\n");

    assert.throws(
      () =>
        prepareImprovement({
          config: { policy },
          improvement: {
            operations: [
              {
                type: "replace_text",
                path: "app/page.tsx",
                description: "Replace stale copy.",
                expectedOccurrences: 1,
                before: "Old copy",
                after: "New copy",
              },
            ],
          },
          rootDir,
          verifyClean: false,
        }),
      /expected 1 occurrence\(s\), found 0/,
    );
  });
});

test("applies one manifest and produces traceable review artifacts", () => {
  withTemporaryRoot((rootDir) => {
    const config = {
      schemaVersion: 2,
      cadence: "weekly",
      mode: "create-reviewable-draft-pr",
      queueDirectory: ".maintenance/improvements/queue",
      focus: ["accessibility"],
      selection: {
        strategy: "priority-then-oldest",
        priorities: ["P1", "P2"],
      },
      policy: {
        ...policy,
        allowedCategories: ["accessibility"],
      },
    };
    const improvement = {
      id: "accessible-status",
      status: "ready",
      priority: "P1",
      area: "Dashboard",
      category: "accessibility",
      title: "Announce a status message",
      problem: "The status is not announced.",
      solution: "Add an explicit status role.",
      acceptance: ["Assistive technology announces the status."],
      createdAt: "2026-08-01T00:00:00.000Z",
      operations: [
        {
          type: "replace_text",
          path: "components/Status.tsx",
          description: "Add the status role.",
          expectedOccurrences: 1,
          before: "<p>Ready</p>",
          after: '<p role="status">Ready</p>',
        },
      ],
    };
    writeFixture(rootDir, ".maintenance/config/weekly-ui-improvements.json", config);
    writeFixture(
      rootDir,
      ".maintenance/improvements/queue/accessible-status.json",
      improvement,
    );
    writeFixture(
      rootDir,
      ".maintenance/IMPROVEMENT_LOG.md",
      "# Weekly UI/UX Improvement Log\n",
      false,
    );
    writeFixture(
      rootDir,
      "components/Status.tsx",
      "export function Status() { return <p>Ready</p>; }\n",
      false,
    );
    const outputPath = path.join(rootDir, "github-output.txt");

    const result = main({
      args: ["--apply"],
      env: { GITHUB_OUTPUT: outputPath },
      now: new Date("2026-08-27T10:00:00.000Z"),
      rootDir,
      verifyClean: false,
    });

    assert.equal(result.applied, true);
    assert.match(
      readFileSync(path.join(rootDir, "components/Status.tsx"), "utf8"),
      /role="status"/,
    );
    assert.equal(
      JSON.parse(
        readFileSync(
          path.join(
            rootDir,
            ".maintenance/improvements/queue/accessible-status.json",
          ),
          "utf8",
        ),
      ).status,
      "proposed",
    );
    assert.match(
      readFileSync(
        path.join(rootDir, ".maintenance/reports/weekly-ui-improvement-pr.md"),
        "utf8",
      ),
      /### Problem detected[\s\S]*### Solution applied[\s\S]*### Files modified/,
    );
    assert.match(readFileSync(outputPath, "utf8"), /applied=true/);
  });
});

function candidate(id, priority, createdAt, status = "ready") {
  return {
    improvement: { id, priority, createdAt, status },
    manifestPath: `${id}.json`,
  };
}

function withTemporaryRoot(callback) {
  const rootDir = mkdtempSync(path.join(tmpdir(), "weekly-ui-improvement-"));
  try {
    callback(rootDir);
  } finally {
    rmSync(rootDir, { force: true, recursive: true });
  }
}

function writeFixture(rootDir, relativePath, value, json = true) {
  const filePath = path.join(rootDir, ...relativePath.split("/"));
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(
    filePath,
    json ? `${JSON.stringify(value, null, 2)}\n` : value,
  );
}
