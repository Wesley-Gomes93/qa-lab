#!/usr/bin/env node
/**
 * QA Lab – Test Execution Report
 *
 * Gera relatório completo com:
 * - Resultados Cypress e Playwright
 * - Comparação de performance (Playwright X vezes mais rápido)
 * - Suítes, arquivo mais lento, camada (API/UI), ambiente
 * - Histórico dos últimos 5 runs
 *
 * Uso: node scripts/execution-report.js [--no-history] [--no-save]
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const TESTS_DIR = path.join(__dirname, "..");
const CYPRESS_REPORTS = path.join(TESTS_DIR, "cypress/reports");
const PLAYWRIGHT_REPORT = path.join(TESTS_DIR, "playwright-report");
const OUTPUT_DIR = path.join(TESTS_DIR, "qa-lab-reports");
const HISTORY_FILE = path.join(OUTPUT_DIR, "history.json");

const skipHistory = process.argv.includes("--no-history");
const skipSave = process.argv.includes("--no-save");

const SUITE_MAP = {
  api: { name: "api", layer: "API" },
  auth: { name: "auth", layer: "UI" },
  admin: { name: "admin", layer: "UI" },
  dashboard: { name: "dashboard", layer: "UI" },
  ui: { name: "ui", layer: "UI" },
  performance: { name: "performance", layer: "UI" },
};

function getSuiteFromFile(file) {
  const match = file.match(/e2e[\\/]([^\\/]+)/) || file.match(/([^\\/]+)[\\/]/);
  const key = match ? match[1].toLowerCase() : "other";
  return SUITE_MAP[key] || { name: key, layer: "UI" };
}

function findLatestMochawesomeJson() {
  const indexJson = path.join(CYPRESS_REPORTS, "html", "index.json");
  if (fs.existsSync(indexJson)) return indexJson;
  const searchDirs = [path.join(CYPRESS_REPORTS, "html"), CYPRESS_REPORTS];
  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
    if (files.length > 0) {
      const withTime = files.map((f) => {
        const full = path.join(dir, f);
        return { full, mtime: fs.statSync(full).mtime.getTime() };
      });
      withTime.sort((a, b) => b.mtime - a.mtime);
      return withTime[0].full;
    }
  }
  return null;
}

function getMochawesomeDuration(node) {
  if (!node) return 0;
  let d = Number(node.duration) || 0;
  for (const s of node.suites || []) d += getMochawesomeDuration(s);
  for (const t of node.tests || []) d += Number(t.duration) || 0;
  return d;
}

function parseCypressReport(jsonPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const stats = data.stats || {};
  const results = data.results || [];

  const fileDurations = [];
  const suiteCounts = {};

  for (const r of results) {
    const file = r.file || r.fullFile || "?";
    const duration = getMochawesomeDuration(r) || r.duration || 0;
    const suite = getSuiteFromFile(file);
    fileDurations.push({ file, duration });
    suiteCounts[suite.name] = (suiteCounts[suite.name] || 0) + 1;
  }

  fileDurations.sort((a, b) => b.duration - a.duration);
  const slowestFile = fileDurations[0];
  const layers = new Set(results.map((r) => getSuiteFromFile(r.file || "").layer));

  return {
    source: "Cypress",
    passed: stats.passes ?? 0,
    failed: stats.failures ?? 0,
    skipped: stats.skipped ?? stats.pending ?? 0,
    total: (stats.passes ?? 0) + (stats.failures ?? 0) + (stats.skipped ?? 0),
    duration: (stats.duration ?? 0) / 1000,
    slowestFile: slowestFile ? `${path.basename(slowestFile.file)} (${(slowestFile.duration / 1000).toFixed(1)}s)` : null,
    suites: Object.keys(suiteCounts).sort(),
    layers: [...layers],
  };
}

function getPlaywrightFileDurations(suites) {
  const files = [];
  const sumDuration = (node) => {
    let d = 0;
    for (const spec of node.specs || []) {
      for (const t of spec.tests || []) {
        const r = t.results?.[0];
        if (r?.duration) d += r.duration;
      }
    }
    for (const sub of node.suites || []) d += sumDuration(sub);
    return d;
  };
  for (const s of suites || []) {
    const file = s.file || s.title;
    const duration = sumDuration(s);
    if (file && duration > 0) files.push({ file, duration });
  }
  return files;
}

function parsePlaywrightReport() {
  const jsonPath = path.join(PLAYWRIGHT_REPORT, "results.json");
  if (!fs.existsSync(jsonPath)) return null;
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const stats = data.stats || {};
  const passed = stats.expected ?? 0;
  const failed = stats.unexpected ?? 0;
  const duration = (stats.duration ?? 0) / 1000;

  const files = getPlaywrightFileDurations(data.suites || []);
  const slowest = files.sort((a, b) => b.duration - a.duration)[0];
  const suiteCounts = {};
  for (const f of files) {
    const suite = getSuiteFromFile(f.file);
    suiteCounts[suite.name] = (suiteCounts[suite.name] || 0) + 1;
  }
  const layers = new Set(files.map((f) => getSuiteFromFile(f.file).layer));

  return {
    source: "Playwright",
    passed,
    failed,
    skipped: stats.skipped ?? 0,
    total: passed + failed,
    duration,
    slowestFile: slowest ? `${path.basename(slowest.file)} (${(slowest.duration / 1000).toFixed(1)}s)` : null,
    suites: Object.keys(suiteCounts).sort(),
    layers: [...layers],
  };
}

function getEnv() {
  const isCI = !!process.env.CI;
  const envName = process.env.GITHUB_ACTIONS ? "CI Pipeline" : isCI ? "CI" : "Local";
  let branch = "?";
  try {
    branch = execSync("git rev-parse --abbrev-ref HEAD 2>/dev/null", { encoding: "utf8" }).trim();
  } catch {}
  return {
    environment: envName,
    branch,
    node: process.version,
  };
}

function loadHistory() {
  if (!fs.existsSync(HISTORY_FILE)) return [];
  try {
    const raw = fs.readFileSync(HISTORY_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveToHistory(cypressData, playwrightData, env) {
  if (skipSave || skipHistory) return;
  const totalPassed = (cypressData?.passed ?? 0) + (playwrightData?.passed ?? 0);
  const totalFailed = (cypressData?.failed ?? 0) + (playwrightData?.failed ?? 0);
  const total = (cypressData?.total ?? 0) + (playwrightData?.total ?? 0);
  const duration = (cypressData?.duration ?? 0) + (playwrightData?.duration ?? 0);
  const entry = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    passed: totalPassed,
    failed: totalFailed,
    total,
    duration: Math.round(duration),
    status: totalFailed === 0 ? "passed" : "failed",
    env: env.environment,
  };
  const history = loadHistory();
  history.unshift(entry);
  const kept = history.slice(0, 20);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(kept, null, 2));
}

function formatReport(cypressData, playwrightData, env, history) {
  const sep = "─".repeat(40);
  const line = "═".repeat(50);

  const totalPassed = (cypressData?.passed ?? 0) + (playwrightData?.passed ?? 0);
  const totalFailed = (cypressData?.failed ?? 0) + (playwrightData?.failed ?? 0);
  const totalTests = (cypressData?.total ?? 0) + (playwrightData?.total ?? 0);
  const totalDuration = (cypressData?.duration ?? 0) + (playwrightData?.duration ?? 0);
  const status = totalFailed === 0 ? "✅ ALL TESTS PASSED" : "❌ SOME TESTS FAILED";

  let out = `\n${line}\n`;
  out += `QA LAB – TEST EXECUTION REPORT\n`;
  out += `${line}\n\n`;
  out += `Environment: ${env.environment}\n`;
  out += `Branch: ${env.branch}\n`;
  out += `Node: ${env.node}\n\n`;

  if (cypressData) {
    out += `${sep}\nCYPRESS RESULTS\n${sep}\n`;
    out += `Passed:   ${cypressData.passed}\n`;
    out += `Failed:   ${cypressData.failed}\n`;
    out += `Skipped:  ${cypressData.skipped}\n`;
    out += `Total:    ${cypressData.total}\n`;
    out += `Duration: ${cypressData.duration.toFixed(1)}s\n`;
    if (cypressData.slowestFile) out += `Slowest:  ${cypressData.slowestFile}\n`;
    if (cypressData.suites?.length) out += `Suites:   ${cypressData.suites.join(", ")}\n`;
    if (cypressData.layers?.length) out += `Layer:   ${cypressData.layers.join(", ")}\n`;
  }

  if (playwrightData) {
    out += `\n${sep}\nPLAYWRIGHT RESULTS\n${sep}\n`;
    out += `Passed:   ${playwrightData.passed}\n`;
    out += `Failed:   ${playwrightData.failed}\n`;
    out += `Skipped:  ${playwrightData.skipped}\n`;
    out += `Total:    ${playwrightData.total}\n`;
    out += `Duration: ${playwrightData.duration.toFixed(1)}s\n`;
    if (playwrightData.slowestFile) out += `Slowest:  ${playwrightData.slowestFile}\n`;
    if (playwrightData.suites?.length) out += `Suites:   ${playwrightData.suites.join(", ")}\n`;
    if (playwrightData.layers?.length) out += `Layer:   ${playwrightData.layers.join(", ")}\n`;
  }

  if (cypressData && playwrightData) {
    const ratio = cypressData.duration / playwrightData.duration;
    const faster = ratio >= 1.05 ? "Playwright" : ratio <= 0.95 ? "Cypress" : null;
    out += `\n${sep}\nCOMPARISON\n${sep}\n`;
    if (faster) {
      const mult = faster === "Playwright" ? ratio : 1 / ratio;
      out += `${faster} execution was ${mult.toFixed(1)}x faster than ${faster === "Playwright" ? "Cypress" : "Playwright"}.\n`;
    } else {
      out += `Both frameworks executed in similar time.\n`;
    }
  }

  out += `\n${sep}\nTOTAL TEST EXECUTION\n${sep}\n`;
  out += `Passed:   ${totalPassed}\n`;
  out += `Failed:   ${totalFailed}\n`;
  out += `Skipped:  ${(cypressData?.skipped ?? 0) + (playwrightData?.skipped ?? 0)}\n`;
  out += `Total:    ${totalTests}\n`;
  out += `Duration: ${totalDuration.toFixed(1)}s\n\n`;
  out += `STATUS: ${status}\n`;
  out += `${line}\n`;

  if (!skipHistory && history.length > 0) {
    out += `\n${sep}\nLAST ${Math.min(5, history.length)} RUNS\n${sep}\n`;
    for (let i = 0; i < Math.min(5, history.length); i++) {
      const h = history[i];
      const runNum = history.length - i;
      const icon = h.status === "passed" ? "✔" : "✖";
      out += `Run #${runNum}  ${icon} ${h.passed} passed`;
      if (h.failed > 0) out += `, ${h.failed} failed`;
      out += `\n`;
    }
    out += `\n`;
  }

  return out;
}

function main() {
  const env = getEnv();
  let cypressData = null;
  let playwrightData = null;

  const cypressPath = findLatestMochawesomeJson();
  if (cypressPath) {
    cypressData = parseCypressReport(cypressPath);
  }

  playwrightData = parsePlaywrightReport();

  if (!cypressData && !playwrightData) {
    console.error("Nenhum relatório encontrado. Rode os testes primeiro.");
    process.exit(1);
  }

  saveToHistory(cypressData, playwrightData, env);
  const history = skipHistory ? [] : loadHistory();
  const report = formatReport(cypressData, playwrightData, env, history);

  console.log(report);

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUTPUT_DIR, "execution-report.txt"), report);
}

main();
