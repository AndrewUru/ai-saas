#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { createRequire } from "node:module";
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
const MAINTENANCE_DIR = path.join(ROOT_DIR, ".maintenance");
const REPORTS_DIR = path.join(MAINTENANCE_DIR, "reports");
const CONFIG_PATH = path.join(MAINTENANCE_DIR, "config", "routes.json");
const requireFromRoot = createRequire(path.join(ROOT_DIR, "package.json"));

const STATUS_ORDER = ["fail", "warn", "skip", "pass"];

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  printHelp();
  process.exit(0);
}

const startedAt = new Date();
const stamp = toStamp(startedAt);
const runDir = path.join(REPORTS_DIR, stamp);
mkdirSync(runDir, { recursive: true });

const packageJson = readJson(path.join(ROOT_DIR, "package.json"));
const routesConfig = readJson(CONFIG_PATH);
const manager = detectPackageManager();
const results = [];
let server = null;

try {
  results.push(manager.result);

  if (!options.skipInstallCheck) {
    results.push(await runInstallReproCheck(manager));
  }

  if (!options.skipLint) {
    results.push(await runPackageScript(manager, "lint", "Lint"));
  }

  if (!options.skipBuild) {
    results.push(await runPackageScript(manager, "build", "Build"));
  }

  if (!options.skipSecurity) {
    results.push(await runDependencySecurityGate(manager));
    results.push(await runOutdatedReport(manager));
  }

  if (!options.skipVisual) {
    const baseUrl = resolveBaseUrl(routesConfig.baseUrl, options);
    const initialReachable = await waitForUrl(baseUrl, 1500);

    if (options.startServer && !initialReachable.ok) {
      const started = await startDevServer(manager, baseUrl);
      results.push(started.result);
      server = started.server;
    } else if (options.startServer && initialReachable.ok) {
      results.push({
        name: "Dev server",
        status: "warn",
        summary: `Reused server already responding at ${baseUrl}.`,
        details: [],
      });
    }

    const reachable = await waitForUrl(baseUrl, options.startServer ? 90000 : 1500);

    if (!reachable.ok) {
      results.push({
        name: "Visual UX scan",
        status: "skip",
        summary: `No server responded at ${baseUrl}. Use --start-server or --url.`,
        details: [reachable.error ?? "Target URL was not reachable."],
      });
      results.push({
        name: "Lighthouse",
        status: "skip",
        summary: "Skipped because the target URL was not reachable.",
        details: [],
      });
    } else {
      results.push(await runVisualAudit(routesConfig, baseUrl, runDir));
      results.push(await runLighthouseAudit(routesConfig, baseUrl, runDir));
    }
  }
} finally {
  if (server?.child && !server.child.killed) {
    stopChildProcess(server.child);
  }
}

const finishedAt = new Date();
const jsonPath = path.join(runDir, "weekly-report.json");
const mdPath = path.join(runDir, "weekly-report.md");

const report = {
  startedAt: startedAt.toISOString(),
  finishedAt: finishedAt.toISOString(),
  durationMs: finishedAt.getTime() - startedAt.getTime(),
  packageManager: manager.name,
  command: `node .maintenance/scripts/quality-gates.mjs ${process.argv.slice(2).join(" ")}`.trim(),
  results,
};

writeFileSync(jsonPath, JSON.stringify(report, null, 2));
writeFileSync(mdPath, renderMarkdown(report, mdPath));

console.log(`Improvement quality report written to ${path.relative(ROOT_DIR, mdPath)}`);

if (!options.noFail && results.some((result) => result.status === "fail")) {
  process.exitCode = 1;
}

function parseArgs(args) {
  const parsed = {
    help: false,
    noFail: false,
    port: null,
    skipSecurity: false,
    skipBuild: false,
    skipInstallCheck: false,
    skipLint: false,
    skipVisual: false,
    startServer: false,
    url: null,
  };

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") parsed.help = true;
    else if (arg === "--no-fail") parsed.noFail = true;
    else if (arg === "--skip-security") parsed.skipSecurity = true;
    else if (arg === "--skip-build") parsed.skipBuild = true;
    else if (arg === "--skip-install-check") parsed.skipInstallCheck = true;
    else if (arg === "--skip-lint") parsed.skipLint = true;
    else if (arg === "--skip-visual") parsed.skipVisual = true;
    else if (arg === "--start-server") parsed.startServer = true;
    else if (arg.startsWith("--url=")) parsed.url = arg.slice("--url=".length);
    else if (arg.startsWith("--port=")) parsed.port = arg.slice("--port=".length);
  }

  return parsed;
}

function printHelp() {
  console.log(`
Usage:
  node .maintenance/scripts/quality-gates.mjs [options]

Options:
  --start-server          Start Next dev server before visual checks.
  --url=<url>             Use an existing app URL.
  --port=<port>           Override the configured local port.
  --skip-install-check    Skip package install reproducibility check.
  --skip-lint             Skip lint.
  --skip-build            Skip build.
  --skip-security         Skip npm/pnpm security and outdated checks.
  --skip-visual           Skip Playwright and Lighthouse checks.
  --no-fail               Always exit 0 after writing the report.
`);
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function toStamp(date) {
  return date.toISOString().replaceAll(":", "-").replace(/\.\d{3}Z$/, "Z");
}

function commandName(binary) {
  return process.platform === "win32" ? `${binary}.cmd` : binary;
}

function prepareSpawn(command, args) {
  if (process.platform !== "win32") {
    return { args, command, shell: false };
  }

  const executable = command.endsWith(".cmd") ? command.slice(0, -4) : command;
  return {
    args: [],
    command: [executable, ...args].map(quoteWindowsShellArg).join(" "),
    shell: true,
  };
}

function quoteWindowsShellArg(value) {
  const text = String(value);
  if (/^[a-zA-Z0-9_./:=+-]+$/.test(text)) return text;
  return `"${text.replace(/(["^&|<>])/g, "^$1")}"`;
}

function detectPackageManager() {
  const hasPackageLock = existsSync(path.join(ROOT_DIR, "package-lock.json"));
  const hasPnpmLock = existsSync(path.join(ROOT_DIR, "pnpm-lock.yaml"));
  const npmVersion = getToolVersion("npm");
  const pnpmVersion = getToolVersion("pnpm");
  const packageManagerField = packageJson.packageManager ?? null;
  const details = [];

  if (packageManagerField) {
    details.push(`packageManager field: ${packageManagerField}`);
  }

  if (hasPackageLock) details.push("Found package-lock.json.");
  if (hasPnpmLock) details.push("Found pnpm-lock.yaml.");
  if (npmVersion.ok) details.push(`npm: ${npmVersion.version}`);
  else details.push("npm not found.");
  if (pnpmVersion.ok) details.push(`pnpm: ${pnpmVersion.version}`);
  else if (hasPnpmLock) details.push("pnpm-lock.yaml exists, but pnpm is not available.");

  let name = "npm";
  if (!hasPackageLock && hasPnpmLock && pnpmVersion.ok) {
    name = "pnpm";
  }

  const warnings = [];
  if (hasPackageLock && hasPnpmLock) {
    warnings.push("Both npm and pnpm lockfiles exist. Standardize on one package manager.");
  }
  if (hasPnpmLock && !pnpmVersion.ok) {
    warnings.push("pnpm lockfile exists but pnpm is not installed in this environment.");
  }
  if (name === "npm" && !npmVersion.ok) {
    warnings.push("npm is selected but not available.");
  }

  return {
    name,
    bin: name,
    runArgs: (scriptName) => ["run", scriptName],
    securityArgs: () => [name === "npm" ? "audit" : "audit", "--json"],
    outdatedArgs: () => [name === "npm" ? "outdated" : "outdated", "--json"],
    result: {
      name: "Package manager",
      status: warnings.length ? "warn" : "pass",
      summary: `Using ${name}. ${warnings[0] ?? "Package manager looks consistent."}`,
      details: [...details, ...warnings],
    },
  };
}

function getToolVersion(binary) {
  const prepared = prepareSpawn(commandName(binary), ["--version"]);
  const result = spawnSync(prepared.command, prepared.args, {
    cwd: ROOT_DIR,
    encoding: "utf8",
    shell: prepared.shell,
    windowsHide: true,
  });

  return {
    ok: result.status === 0,
    version: (result.stdout || result.stderr || "").trim(),
  };
}

async function runInstallReproCheck(manager) {
  if (manager.name === "pnpm") {
    return runCheck({
      name: "Install reproducibility",
      command: commandName("pnpm"),
      args: ["install", "--frozen-lockfile", "--lockfile-only"],
      okSummary: "pnpm lockfile can be resolved.",
      failSummary: "pnpm install check failed.",
      timeoutMs: 120000,
    });
  }

  return runCheck({
    name: "Install reproducibility",
    command: commandName("npm"),
    args: ["install", "--package-lock-only", "--dry-run", "--ignore-scripts"],
    okSummary: "npm can resolve the package tree.",
    failSummary: "npm cannot resolve the package tree cleanly.",
    timeoutMs: 120000,
  });
}

async function runPackageScript(manager, scriptName, label) {
  if (!packageJson.scripts?.[scriptName]) {
    return {
      name: label,
      status: "skip",
      summary: `No ${scriptName} script is defined.`,
      details: [],
    };
  }

  return runCheck({
    name: label,
    command: commandName(manager.bin),
    args: manager.runArgs(scriptName),
    okSummary: `${scriptName} completed successfully.`,
    failSummary: `${scriptName} failed.`,
    timeoutMs: scriptName === "build" ? 180000 : 120000,
  });
}

async function runDependencySecurityGate(manager) {
  const result = await runProcess(commandName(manager.bin), manager.securityArgs(), {
    timeoutMs: 120000,
  });
  const parsed = parseJsonLoose(result.stdout);

  if (!parsed) {
    return processResultToCheck({
      name: "Dependency security gate",
      result,
      okSummary: "Dependency security gate completed.",
      failSummary: "Dependency security gate failed or returned invalid JSON.",
    });
  }

  const vulnerabilities = parsed.metadata?.vulnerabilities ?? {};
  const total = vulnerabilities.total ?? 0;
  const high = vulnerabilities.high ?? 0;
  const critical = vulnerabilities.critical ?? 0;
  const moderate = vulnerabilities.moderate ?? 0;

  return {
    name: "Dependency security gate",
    status: critical || high ? "fail" : total ? "warn" : "pass",
    summary: total
      ? `${total} vulnerabilities found (${critical} critical, ${high} high, ${moderate} moderate).`
      : "No vulnerabilities reported.",
    details: [
      `Command exit code: ${result.code}`,
      ...Object.entries(vulnerabilities).map(([key, value]) => `${key}: ${value}`),
      excerpt(result.stderr || result.stdout),
    ].filter(Boolean),
  };
}

async function runOutdatedReport(manager) {
  const result = await runProcess(commandName(manager.bin), manager.outdatedArgs(), {
    timeoutMs: 120000,
  });
  const parsed = parseJsonLoose(result.stdout);

  if (!parsed && result.code === 0) {
    return {
      name: "Outdated packages",
      status: "pass",
      summary: "No outdated packages reported.",
      details: [],
    };
  }

  if (!parsed) {
    return processResultToCheck({
      name: "Outdated packages",
      result,
      okSummary: "Outdated package check completed.",
      failSummary: "Outdated package check failed or returned invalid JSON.",
    });
  }

  const entries = Object.entries(parsed);
  const details = entries
    .slice(0, 30)
    .map(([name, info]) => `${name}: current ${info.current}, wanted ${info.wanted}, latest ${info.latest}`);

  return {
    name: "Outdated packages",
    status: entries.length ? "warn" : "pass",
    summary: entries.length ? `${entries.length} packages are outdated.` : "No outdated packages reported.",
    details,
  };
}

async function runCheck({ name, command, args, okSummary, failSummary, timeoutMs }) {
  const result = await runProcess(command, args, { timeoutMs });
  return processResultToCheck({ name, result, okSummary, failSummary });
}

function processResultToCheck({ name, result, okSummary, failSummary }) {
  return {
    name,
    status: result.code === 0 ? "pass" : "fail",
    summary: result.code === 0 ? okSummary : failSummary,
    durationMs: result.durationMs,
    details: [
      `Command: ${result.command}`,
      `Exit code: ${result.code}`,
      result.timedOut ? "Timed out." : "",
      excerpt(result.stdout),
      excerpt(result.stderr),
    ].filter(Boolean),
  };
}

function runProcess(command, args, { timeoutMs = 120000, env = {} } = {}) {
  const started = Date.now();
  const commandText = [command, ...args].join(" ");
  const prepared = prepareSpawn(command, args);

  return new Promise((resolve) => {
    const child = spawn(prepared.command, prepared.args, {
      cwd: ROOT_DIR,
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: "1",
        ...env,
      },
      shell: prepared.shell,
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => {
      clearTimeout(timer);
      resolve({
        code: -1,
        command: commandText,
        durationMs: Date.now() - started,
        error: error.message,
        stderr: `${stderr}\n${error.message}`.trim(),
        stdout,
        timedOut,
      });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolve({
        code,
        command: commandText,
        durationMs: Date.now() - started,
        stderr,
        stdout,
        timedOut,
      });
    });
  });
}

function resolveBaseUrl(configuredUrl, parsedOptions) {
  const baseUrl = new URL(parsedOptions.url || configuredUrl);
  if (parsedOptions.port) {
    baseUrl.port = parsedOptions.port;
  }
  return baseUrl.toString().replace(/\/$/, "");
}

async function startDevServer(manager, baseUrl) {
  const url = new URL(baseUrl);
  const hostname = url.hostname || "127.0.0.1";
  const port = url.port || "3000";
  const args = [...manager.runArgs("dev"), "--", "--hostname", hostname, "--port", port];
  const prepared = prepareSpawn(commandName(manager.bin), args);
  const child = spawn(prepared.command, prepared.args, {
    cwd: ROOT_DIR,
    env: {
      ...process.env,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || baseUrl,
      NEXT_TELEMETRY_DISABLED: "1",
      SITE_URL: process.env.SITE_URL || baseUrl,
    },
    shell: prepared.shell,
    windowsHide: true,
  });
  const logs = [];

  child.stdout?.on("data", (chunk) => {
    logs.push(chunk.toString());
    if (logs.length > 80) logs.shift();
  });
  child.stderr?.on("data", (chunk) => {
    logs.push(chunk.toString());
    if (logs.length > 80) logs.shift();
  });

  const reachable = await waitForUrl(baseUrl, 90000);

  if (!reachable.ok) {
    stopChildProcess(child);
    return {
      server: null,
      result: {
        name: "Dev server",
        status: "fail",
        summary: `Could not start dev server at ${baseUrl}.`,
        details: [reachable.error ?? "Server did not respond.", excerpt(logs.join(""))].filter(Boolean),
      },
    };
  }

  return {
    server: { child },
    result: {
      name: "Dev server",
      status: "pass",
      summary: `Started dev server at ${baseUrl}.`,
      details: [],
    },
  };
}

function stopChildProcess(child) {
  if (!child?.pid) return;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      encoding: "utf8",
      windowsHide: true,
    });
    return;
  }

  child.kill("SIGTERM");
}

async function waitForUrl(url, timeoutMs) {
  const started = Date.now();
  let lastError = "";

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) {
        return { ok: true, status: response.status };
      }
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }

    await delay(1000);
  }

  return { ok: false, error: lastError };
}

async function runVisualAudit(config, baseUrl, reportDir) {
  const playwright = await optionalImport("playwright");
  const chromium = playwright?.chromium ?? playwright?.default?.chromium;

  if (!chromium) {
    return {
      name: "Visual UX scan",
      status: "skip",
      summary: "Playwright is not installed.",
      details: [
        "Install optional tooling after package manager cleanup: npm install -D playwright lighthouse chrome-launcher",
      ],
    };
  }

  const screenshotsDir = path.join(reportDir, "screenshots");
  mkdirSync(screenshotsDir, { recursive: true });
  const pages = [];
  const browser = await chromium.launch({ headless: true });

  try {
    for (const route of config.routes ?? ["/"]) {
      for (const viewport of config.viewports ?? []) {
        const context = await browser.newContext({
          viewport: {
            width: viewport.width,
            height: viewport.height,
          },
        });
        const page = await context.newPage();
        const consoleErrors = [];
        const pageErrors = [];
        const url = new URL(route, `${baseUrl}/`).toString();

        page.on("console", (message) => {
          if (message.type() === "error") {
            consoleErrors.push(message.text());
          }
        });
        page.on("pageerror", (error) => {
          pageErrors.push(error.message);
        });

        let responseStatus = null;
        let navigationError = null;

        try {
          const response = await page.goto(url, {
            timeout: 45000,
            waitUntil: "networkidle",
          });
          responseStatus = response?.status() ?? null;
        } catch (error) {
          navigationError = error.message;
        }

        await page.waitForTimeout(500);

        const screenshotName = `${slugify(route || "home")}-${viewport.name}.png`;
        const screenshotPath = path.join(screenshotsDir, screenshotName);
        let checks = null;

        try {
          await page.screenshot({ fullPage: true, path: screenshotPath });
          checks = await page.evaluate(collectVisualIssues);
        } catch (error) {
          pageErrors.push(error.message);
        }

        pages.push({
          consoleErrors,
          pageErrors,
          route,
          screenshot: path.relative(ROOT_DIR, screenshotPath),
          viewport,
          responseStatus,
          navigationError,
          checks,
        });

        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  const visualJson = path.join(reportDir, "visual-results.json");
  writeFileSync(visualJson, JSON.stringify(pages, null, 2));

  const issueCount = pages.reduce((count, page) => {
    if (page.navigationError) count += 1;
    count += page.consoleErrors.length;
    count += page.pageErrors.length;
    count += page.checks?.brokenImages?.length ?? 0;
    count += page.checks?.blankCanvases?.length ?? 0;
    count += page.checks?.clippedText?.length ?? 0;
    count += page.checks?.horizontalOverflow ? 1 : 0;
    return count;
  }, 0);

  const details = pages.flatMap((page) => summarizeVisualPage(page)).slice(0, 80);

  return {
    name: "Visual UX scan",
    status: issueCount ? "warn" : "pass",
    summary: issueCount
      ? `${issueCount} visual signals found across ${pages.length} captures.`
      : `${pages.length} captures completed with no basic visual signals.`,
    artifacts: [
      path.relative(ROOT_DIR, visualJson),
      path.relative(ROOT_DIR, screenshotsDir),
    ],
    details,
  };
}

async function runLighthouseAudit(config, baseUrl, reportDir) {
  const lighthouseModule = await optionalImport("lighthouse");
  const chromeLauncherModule = await optionalImport("chrome-launcher");
  const lighthouse = lighthouseModule?.default ?? lighthouseModule;
  const chromeLauncher = chromeLauncherModule?.default ?? chromeLauncherModule;

  if (!lighthouse || !chromeLauncher?.launch) {
    return {
      name: "Lighthouse",
      status: "skip",
      summary: "Lighthouse tooling is not installed.",
      details: [
        "Install optional tooling after package manager cleanup: npm install -D playwright lighthouse chrome-launcher",
      ],
    };
  }

  const reports = [];
  let chrome = null;

  try {
    chrome = await chromeLauncher.launch({
      chromeFlags: ["--headless=new", "--no-sandbox", "--disable-gpu"],
    });

    for (const route of config.lighthouseRoutes ?? ["/"]) {
      const url = new URL(route, `${baseUrl}/`).toString();
      const result = await lighthouse(url, {
        logLevel: "error",
        output: ["json", "html"],
        port: chrome.port,
      });
      const slug = slugify(route || "home");
      const jsonPath = path.join(reportDir, `lighthouse-${slug}.json`);
      const htmlPath = path.join(reportDir, `lighthouse-${slug}.html`);
      const [jsonOutput, htmlOutput] = Array.isArray(result.report)
        ? result.report
        : [JSON.stringify(result.lhr, null, 2), result.report];

      writeFileSync(jsonPath, jsonOutput);
      writeFileSync(htmlPath, htmlOutput);

      reports.push({
        route,
        scores: Object.fromEntries(
          Object.entries(result.lhr.categories).map(([key, category]) => [
            key,
            Math.round((category.score ?? 0) * 100),
          ]),
        ),
        artifacts: [path.relative(ROOT_DIR, jsonPath), path.relative(ROOT_DIR, htmlPath)],
      });
    }
  } catch (error) {
    return {
      name: "Lighthouse",
      status: "fail",
      summary: "Lighthouse failed to run.",
      details: [error.message],
    };
  } finally {
    await chrome?.kill();
  }

  const lowScores = reports.flatMap((report) =>
    Object.entries(report.scores)
      .filter(([key, score]) => {
        if (key === "performance") return score < 70;
        return score < 90;
      })
      .map(([key, score]) => `${report.route} ${key}: ${score}`),
  );

  return {
    name: "Lighthouse",
    status: lowScores.length ? "warn" : "pass",
    summary: lowScores.length
      ? `Lighthouse found ${lowScores.length} low score signals.`
      : `Lighthouse completed for ${reports.length} route(s).`,
    artifacts: reports.flatMap((report) => report.artifacts),
    details: reports
      .map((report) => {
        const scores = Object.entries(report.scores)
          .map(([key, value]) => `${key} ${value}`)
          .join(", ");
        return `${report.route}: ${scores}`;
      })
      .concat(lowScores.map((score) => `Low score: ${score}`)),
  };
}

async function optionalImport(specifier) {
  try {
    requireFromRoot.resolve(specifier);
  } catch {
    return null;
  }

  try {
    return await import(specifier);
  } catch (error) {
    return { importError: error.message };
  }
}

function collectVisualIssues() {
  function selectorFor(element) {
    if (element.id) return `#${element.id}`;
    const parts = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE && parts.length < 4) {
      let part = current.tagName.toLowerCase();
      if (current.classList.length) {
        part += `.${Array.from(current.classList).slice(0, 2).join(".")}`;
      }
      const parent = current.parentElement;
      if (parent) {
        const sameTag = Array.from(parent.children).filter((child) => child.tagName === current.tagName);
        if (sameTag.length > 1) {
          part += `:nth-of-type(${sameTag.indexOf(current) + 1})`;
        }
      }
      parts.unshift(part);
      current = parent;
    }

    return parts.join(" > ");
  }

  function isVisible(element) {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number.parseFloat(style.opacity || "1") > 0.01 &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  function canvasLooksBlank(canvas) {
    if (!canvas.width || !canvas.height) return true;
    try {
      const context = canvas.getContext("2d");
      if (!context) return false;
      const sampleWidth = Math.min(canvas.width, 80);
      const sampleHeight = Math.min(canvas.height, 80);
      const data = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
      for (let index = 3; index < data.length; index += 4) {
        if (data[index] !== 0) return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  const doc = document.documentElement;
  const horizontalOverflow = doc.scrollWidth > doc.clientWidth + 2;
  const brokenImages = Array.from(document.images)
    .filter((image) => isVisible(image) && (!image.complete || image.naturalWidth === 0))
    .map((image) => ({
      selector: selectorFor(image),
      src: image.currentSrc || image.src,
    }))
    .slice(0, 20);
  const blankCanvases = Array.from(document.querySelectorAll("canvas"))
    .filter((canvas) => isVisible(canvas) && canvasLooksBlank(canvas))
    .map((canvas) => ({
      selector: selectorFor(canvas),
      width: canvas.width,
      height: canvas.height,
    }))
    .slice(0, 20);
  const skippedTags = new Set(["script", "style", "svg", "path", "canvas", "img", "video"]);
  const clippedText = Array.from(document.body.querySelectorAll("*"))
    .filter((element) => {
      const tag = element.tagName.toLowerCase();
      if (skippedTags.has(tag) || !isVisible(element)) return false;
      const text = (element.innerText || "").trim().replace(/\s+/g, " ");
      if (text.length < 2) return false;
      const style = window.getComputedStyle(element);
      const clipsX = ["hidden", "clip"].includes(style.overflowX);
      const clipsY = ["hidden", "clip"].includes(style.overflowY);
      return (
        (clipsX && element.scrollWidth > element.clientWidth + 2) ||
        (clipsY && element.scrollHeight > element.clientHeight + 2)
      );
    })
    .map((element) => ({
      selector: selectorFor(element),
      text: (element.innerText || "").trim().replace(/\s+/g, " ").slice(0, 100),
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
    }))
    .slice(0, 30);

  return {
    blankCanvases,
    brokenImages,
    clippedText,
    horizontalOverflow,
    scrollWidth: doc.scrollWidth,
    clientWidth: doc.clientWidth,
  };
}

function summarizeVisualPage(page) {
  const label = `${page.route} ${page.viewport.name}`;
  const lines = [];

  if (page.navigationError) lines.push(`${label}: navigation error: ${page.navigationError}`);
  if (page.responseStatus && page.responseStatus >= 400) lines.push(`${label}: HTTP ${page.responseStatus}`);
  if (page.consoleErrors.length) lines.push(`${label}: ${page.consoleErrors.length} console error(s).`);
  if (page.pageErrors.length) lines.push(`${label}: ${page.pageErrors.length} page error(s).`);
  if (page.checks?.horizontalOverflow) {
    lines.push(`${label}: horizontal overflow (${page.checks.scrollWidth}px > ${page.checks.clientWidth}px).`);
  }
  if (page.checks?.brokenImages?.length) {
    lines.push(`${label}: ${page.checks.brokenImages.length} broken image(s).`);
  }
  if (page.checks?.blankCanvases?.length) {
    lines.push(`${label}: ${page.checks.blankCanvases.length} blank canvas signal(s).`);
  }
  if (page.checks?.clippedText?.length) {
    lines.push(`${label}: ${page.checks.clippedText.length} clipped text signal(s).`);
  }
  if (!lines.length) lines.push(`${label}: ok.`);

  return lines;
}

function parseJsonLoose(value) {
  if (!value?.trim()) return null;
  try {
    return JSON.parse(value);
  } catch {
    const start = value.indexOf("{");
    const end = value.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(value.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function excerpt(value, maxChars = 4000) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";
  const normalized = trimmed.split(/\r?\n/).slice(-80).join("\n");
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, maxChars)}\n...`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function slugify(value) {
  const slug = value
    .replace(/^\/$/, "home")
    .replace(/^\//, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return slug || "home";
}

function renderMarkdown(report, mdPath) {
  const counts = Object.fromEntries(STATUS_ORDER.map((status) => [status, 0]));
  for (const result of report.results) {
    counts[result.status] = (counts[result.status] ?? 0) + 1;
  }

  const relativeReportPath = path.relative(ROOT_DIR, mdPath);
  const lines = [
    "# Weekly UI/UX Improvement Quality Gate",
    "",
    `Generated: ${report.finishedAt}`,
    `Duration: ${Math.round(report.durationMs / 1000)}s`,
    `Command: \`${report.command}\``,
    `Report path: \`${relativeReportPath}\``,
    "",
    "## Summary",
    "",
    `- Fail: ${counts.fail}`,
    `- Warn: ${counts.warn}`,
    `- Skip: ${counts.skip}`,
    `- Pass: ${counts.pass}`,
    "",
    "## Checks",
    "",
    "| Status | Check | Summary |",
    "| --- | --- | --- |",
    ...report.results.map((result) => `| ${result.status.toUpperCase()} | ${escapePipes(result.name)} | ${escapePipes(result.summary)} |`),
    "",
    "## Details",
    "",
  ];

  for (const result of [...report.results].sort(sortByStatus)) {
    lines.push(`### ${result.status.toUpperCase()} - ${result.name}`, "");
    lines.push(result.summary, "");

    if (result.artifacts?.length) {
      lines.push("Artifacts:");
      for (const artifact of result.artifacts) {
        lines.push(`- \`${artifact}\``);
      }
      lines.push("");
    }

    if (result.details?.length) {
      for (const detail of result.details) {
        if (detail.includes("\n")) {
          lines.push("```text", detail, "```");
        } else {
          lines.push(`- ${detail}`);
        }
      }
      lines.push("");
    }
  }

  const nextActions = buildNextActions(report.results);
  if (nextActions.length) {
    lines.push("## Suggested Next Actions", "");
    for (const action of nextActions) {
      lines.push(`- ${action}`);
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

function sortByStatus(a, b) {
  return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
}

function escapePipes(value) {
  return String(value).replaceAll("|", "\\|").replace(/\r?\n/g, " ");
}

function buildNextActions(results) {
  const actions = [];

  for (const result of results) {
    if (result.name === "Package manager" && result.status !== "pass") {
      actions.push("Estandarizar gestor de paquetes antes de activar GitHub Actions semanal.");
    }
    if (result.name === "Install reproducibility" && result.status === "fail") {
      actions.push("Resolver la instalacion reproducible; revisar peer dependencies y lockfile elegido.");
    }
    if (result.name === "Dependency security gate" && result.status !== "pass") {
      actions.push("Priorizar vulnerabilidades high/critical antes de mejoras de pulido.");
    }
    if (result.name === "Outdated packages" && result.status !== "pass") {
      actions.push("Agrupar updates minor/patch en PR pequeno y revisar majors aparte.");
    }
    if (result.name === "Visual UX scan" && result.status === "skip") {
      actions.push("Instalar herramientas visuales opcionales cuando el gestor de paquetes este limpio.");
    }
    if (result.name === "Visual UX scan" && result.status === "warn") {
      actions.push("Revisar capturas y convertir overflow/texto cortado/consola en tareas concretas.");
    }
    if (result.name === "Lighthouse" && result.status === "warn") {
      actions.push("Crear tareas separadas para scores Lighthouse bajos, empezando por accesibilidad.");
    }
  }

  return [...new Set(actions)];
}
