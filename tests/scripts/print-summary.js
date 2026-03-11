#!/usr/bin/env node
/**
 * QA Lab – Resumo de execução
 * Imprime quantidade de testes: passou, falhou, skip, total e duração.
 * Lê os relatórios JSON gerados pelo Cypress e Playwright.
 *
 * Uso: node scripts/print-summary.js [cypress|playwright|all]
 */

const fs = require("fs");
const path = require("path");

const TESTS_DIR = path.join(__dirname, "..");
const CYPRESS_REPORTS = path.join(TESTS_DIR, "cypress/reports");
const PLAYWRIGHT_REPORT = path.join(TESTS_DIR, "playwright-report");

function findLatestMochawesomeJson() {
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

function parseCypress(jsonPath) {
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const s = data.stats || {};
  return {
    passed: s.passes ?? 0,
    failed: s.failures ?? 0,
    skipped: s.pending ?? s.skipped ?? 0,
    total: (s.passes ?? 0) + (s.failures ?? 0) + (s.pending ?? 0) + (s.skipped ?? 0),
    duration: s.duration ?? 0,
  };
}

function parsePlaywright() {
  const jsonPath = path.join(PLAYWRIGHT_REPORT, "results.json");
  if (!fs.existsSync(jsonPath)) return null;
  const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const s = data.stats || {};
  return {
    passed: s.expected ?? 0,
    failed: s.unexpected ?? 0,
    skipped: s.skipped ?? 0,
    total: (s.expected ?? 0) + (s.unexpected ?? 0) + (s.skipped ?? 0),
    duration: s.duration ?? 0,
  };
}

function printSummary(source, data) {
  const duration = (data.duration / 1000).toFixed(1);
  const status = data.failed > 0 ? "❌" : "✅";
  console.log("\n" + "─".repeat(50));
  console.log(`${status} RESUMO – ${source}`);
  console.log("─".repeat(50));
  console.log(`   Passou:   ${data.passed}`);
  console.log(`   Falhou:   ${data.failed}`);
  console.log(`   Skip:     ${data.skipped}`);
  console.log(`   Total:    ${data.total}`);
  console.log(`   Duração:  ${duration}s`);
  console.log("─".repeat(50) + "\n");
}

function main() {
  const arg = (process.argv[2] || "all").toLowerCase();
  let printed = false;
  let cypressData = null;
  let playwrightData = null;

  if (arg === "cypress" || arg === "all") {
    const cypressPath = findLatestMochawesomeJson();
    if (cypressPath) {
      cypressData = parseCypress(cypressPath);
      if (arg === "cypress") {
        printSummary("Cypress", cypressData);
      }
      printed = true;
    }
  }

  if (arg === "playwright" || arg === "all") {
    playwrightData = parsePlaywright();
    if (playwrightData) {
      if (arg === "playwright") {
        printSummary("Playwright", playwrightData);
      }
      printed = true;
    }
  }

  if (arg === "all" && (cypressData || playwrightData)) {
    if (cypressData) printSummary("Cypress", cypressData);
    if (playwrightData) printSummary("Playwright", playwrightData);
    if (cypressData && playwrightData) {
      const total = {
        passed: cypressData.passed + playwrightData.passed,
        failed: cypressData.failed + playwrightData.failed,
        skipped: cypressData.skipped + playwrightData.skipped,
        total: cypressData.total + playwrightData.total,
        duration: cypressData.duration + playwrightData.duration,
      };
      printSummary("TOTAL (Cypress + Playwright)", total);
    }
  }

  if (!printed) {
    console.log("\n[Resumo] Nenhum relatório encontrado. Rode os testes primeiro.\n");
  }
}

main();
