#!/usr/bin/env node

import { appendFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  main as inspectQueue,
  prepareImprovement,
  validateConfig,
  validateImprovement,
} from "./weekly-ui-improvement.mjs";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONFIG_PATH = ".maintenance/config/weekly-ui-improvements.json";

export function queueStatus({ rootDir = ROOT_DIR, env = process.env } = {}) {
  const result = inspectQueue({ args: ["--dry-run"], rootDir, env: {} });
  const ready = result.reason === "dry-run";
  writeGithubOutput(env, "ready", String(ready));
  return ready;
}

export function validateCandidate({
  candidatePath,
  rootDir = ROOT_DIR,
  verifyClean = true,
} = {}) {
  const candidate = JSON.parse(readFileSync(candidatePath, "utf8"));
  if (candidate?.noImprovement) {
    if (
      Object.keys(candidate).length !== 1 ||
      typeof candidate.noImprovement !== "string" ||
      !candidate.noImprovement.trim()
    ) {
      throw new Error("noImprovement must be the only key and explain why.");
    }
    return { generated: false, reason: candidate.noImprovement.trim() };
  }

  const config = validateConfig(
    JSON.parse(readFileSync(path.join(rootDir, CONFIG_PATH), "utf8")),
  );
  const improvement = validateImprovement(candidate, config, "Codex candidate");
  if (improvement.status !== "ready") {
    throw new Error("Codex candidate must have status: ready.");
  }
  if (improvement.proposedAt !== undefined || improvement.files !== undefined) {
    throw new Error("Codex candidate cannot contain proposal results.");
  }

  const queuePath = path.join(rootDir, config.queueDirectory);
  const manifestPath = path.join(queuePath, `${improvement.id}.json`);
  if (existsSync(manifestPath)) {
    throw new Error(`Improvement id already exists in queue: ${improvement.id}`);
  }
  for (const name of readdirSync(queuePath).filter((item) => item.endsWith(".json"))) {
    const queued = JSON.parse(readFileSync(path.join(queuePath, name), "utf8"));
    if (queued.id === improvement.id) {
      throw new Error(`Improvement id already exists in queue: ${improvement.id}`);
    }
  }
  const prepared = prepareImprovement({
    config,
    improvement,
    rootDir,
    verifyClean,
  });
  return { generated: true, improvement, manifestPath, prepared };
}

export function stageCandidate({
  candidatePath,
  rootDir = ROOT_DIR,
  env = process.env,
  verifyClean = true,
} = {}) {
  const result = validateCandidate({ candidatePath, rootDir, verifyClean });
  writeGithubOutput(env, "generated", String(result.generated));
  if (!result.generated) {
    console.log(`No safe UI/UX improvement proposed: ${result.reason}`);
    return result;
  }
  writeFileSync(result.manifestPath, `${JSON.stringify(result.improvement, null, 2)}\n`, {
    flag: "wx",
  });
  console.log(`Validated proposal: ${path.relative(rootDir, result.manifestPath)}`);
  return result;
}

function writeGithubOutput(env, key, value) {
  if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

const isEntrypoint =
  process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isEntrypoint) {
  try {
    const [mode, candidatePath] = process.argv.slice(2);
    if (mode === "--queue-status" && !candidatePath) queueStatus();
    else if (mode === "--validate" && candidatePath) {
      const result = validateCandidate({ candidatePath });
      writeGithubOutput(process.env, "generated", String(result.generated));
      console.log(result.generated ? `Validated ${result.improvement.id}.` : result.reason);
    } else if (mode === "--stage" && candidatePath) {
      stageCandidate({ candidatePath });
    } else {
      throw new Error("Usage: weekly-ui-proposal.mjs --queue-status|--validate FILE|--stage FILE");
    }
  } catch (error) {
    console.error(`Weekly UI/UX proposal failed: ${error.message}`);
    process.exitCode = 1;
  }
}
