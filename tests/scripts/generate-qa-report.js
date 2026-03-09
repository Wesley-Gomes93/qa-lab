#!/usr/bin/env node
/**
 * QA Lab - Relatório Unificado
 * Gera um relatório HTML personalizado combinando Cypress (mochawesome) e Playwright.
 *
 * Uso:
 *   node scripts/generate-qa-report.js
 *   node scripts/generate-qa-report.js --cypress-only
 *   node scripts/generate-qa-report.js --playwright-only
 *
 * Depende de ter rodado os testes antes (cypress run e/ou playwright test).
 */

const fs = require("fs");
const path = require("path");

const TESTS_DIR = path.join(__dirname, "..");
const CYPRESS_REPORTS = path.join(TESTS_DIR, "cypress/reports");
const PLAYWRIGHT_REPORT = path.join(TESTS_DIR, "playwright-report");
const OUTPUT_DIR = path.join(TESTS_DIR, "qa-lab-reports");
const OUTPUT_HTML = path.join(OUTPUT_DIR, "index.html");

const cypressOnly = process.argv.includes("--cypress-only");
const playwrightOnly = process.argv.includes("--playwright-only");

function findLatestMochawesomeJson() {
  const searchDirs = [CYPRESS_REPORTS, path.join(CYPRESS_REPORTS, "html")];
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

function parseCypressReport(jsonPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const stats = data.stats || {};
  return {
    source: "Cypress",
    passed: stats.passes ?? 0,
    failed: stats.failures ?? 0,
    pending: stats.pending ?? 0,
    total: (stats.passes ?? 0) + (stats.failures ?? 0),
    duration: stats.duration ?? 0,
    suites: (data.results || []).map((r) => ({
      name: r.file || "?",
      passed: r.passes?.length ?? 0,
      failed: r.failures?.length ?? 0,
      tests: (r.passes || []).concat(r.failures || []).map((t) => ({
        title: t.fullTitle || t.title,
        state: t.state || (t.pass ? "passed" : "failed"),
      })),
    })),
  };
}

function parsePlaywrightReport() {
  const jsonPath = path.join(PLAYWRIGHT_REPORT, "results.json");
  if (!fs.existsSync(jsonPath)) return null;
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const stats = data.stats || {};
  const passed = stats.expected ?? 0;
  const failed = stats.unexpected ?? 0;
  const duration = stats.duration ?? 0;
  return {
    source: "Playwright",
    passed,
    failed,
    total: passed + failed,
    duration,
    suites: [],
  };
}

function generateHtml(cypressData, playwrightData) {
  const reports = [];
  if (cypressData) reports.push(cypressData);
  if (playwrightData) reports.push(playwrightData);

  const totalPassed = reports.reduce((s, r) => s + r.passed, 0);
  const totalFailed = reports.reduce((s, r) => s + r.failed, 0);
  const totalTests = reports.reduce((s, r) => s + (r.total || r.passed + r.failed), 0);
  const status = totalFailed === 0 ? "✅ PASSOU" : "❌ FALHOU";

  const now = new Date().toLocaleString("pt-BR");
  const cypressHtml = cypressData
    ? `
    <section class="report-section">
      <h2>🧪 Cypress</h2>
      <p><strong>${cypressData.passed}</strong> passaram • <strong>${cypressData.failed}</strong> falharam • ${(cypressData.duration / 1000).toFixed(1)}s</p>
      <p><a href="../cypress/reports/html/index.html" target="_blank">Ver relatório completo →</a></p>
    </section>`
    : "";

  const playwrightHtml = playwrightData
    ? `
    <section class="report-section">
      <h2>🎭 Playwright</h2>
      <p><strong>${playwrightData.passed}</strong> passaram • <strong>${playwrightData.failed}</strong> falharam • ${(playwrightData.duration / 1000).toFixed(1)}s</p>
      <p><a href="../playwright-report/index.html" target="_blank">Ver relatório completo →</a></p>
    </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QA Lab – Relatório de Testes</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; background: #0c0f14; color: #e4e4e7; line-height: 1.6; }
    h1 { color: #10b981; font-size: 1.75rem; margin-bottom: 0.5rem; }
    .subtitle { color: #71717a; font-size: 0.9rem; margin-bottom: 2rem; }
    .summary { background: linear-gradient(135deg, #18181b 0%, #27272a 100%); border-radius: 12px; padding: 1.5rem; margin-bottom: 2rem; border: 1px solid #3f3f46; }
    .summary .status { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
    .summary .status.pass { color: #10b981; }
    .summary .status.fail { color: #ef4444; }
    .report-section { background: #18181b; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; border: 1px solid #3f3f46; }
    .report-section h2 { margin: 0 0 0.5rem 0; font-size: 1.1rem; }
    .report-section p { margin: 0.25rem 0; color: #a1a1aa; }
    .report-section a { color: #10b981; text-decoration: none; }
    .report-section a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>QA Lab – Relatório de Testes</h1>
  <p class="subtitle">Gerado em ${now}</p>
  <div class="summary">
    <div class="status ${totalFailed === 0 ? "pass" : "fail"}">${status}</div>
    <p><strong>${totalTests}</strong> testes • <strong>${totalPassed}</strong> passaram • <strong>${totalFailed}</strong> falharam</p>
  </div>
  ${cypressHtml}
  ${playwrightHtml}
</body>
</html>`;
}

function main() {
  let cypressData = null;
  let playwrightData = null;

  if (!playwrightOnly) {
    const cypressPath = findLatestMochawesomeJson();
    if (cypressPath) {
      cypressData = parseCypressReport(cypressPath);
      console.log("[QA Report] Cypress:", cypressData.passed, "passed,", cypressData.failed, "failed");
    } else {
      console.warn("[QA Report] Nenhum relatório Cypress encontrado. Rode: cd tests && npx cypress run");
    }
  }

  if (!cypressOnly) {
    playwrightData = parsePlaywrightReport();
    if (playwrightData) {
      console.log("[QA Report] Playwright:", playwrightData.passed, "passed,", playwrightData.failed, "failed");
    } else {
      console.warn("[QA Report] Nenhum relatório Playwright encontrado. Rode: cd tests && npx playwright test");
    }
  }

  if (!cypressData && !playwrightData) {
    console.error("Nenhum relatório encontrado. Rode os testes primeiro.");
    process.exit(1);
  }

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const html = generateHtml(cypressData, playwrightData);
  fs.writeFileSync(OUTPUT_HTML, html);
  console.log("[QA Report] Salvo em:", OUTPUT_HTML);
}

main();
