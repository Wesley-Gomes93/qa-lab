#!/usr/bin/env node
/**
 * QA Lab - Verificação de Lint com Resumo
 * Roda ESLint em todas as pastas (frontend, backend, tests, agents) e exibe resumo.
 *
 * Uso: node scripts/lint-check.js
 *      npm run lint:check (na raiz)
 */

const { spawn } = require("child_process");
const path = require("path");

const ROOT = path.join(__dirname, "..");

function runLint(cwd, targets = ["."]) {
  return new Promise((resolve) => {
    const result = spawn("npx", ["eslint", "--format", "json", ...targets], {
      cwd,
      stdio: ["inherit", "pipe", "pipe"],
      shell: true,
    });

    let stdout = "";
    result.stdout?.on("data", (d) => { stdout += d.toString(); });
    result.stderr?.on("data", (d) => { stdout += d.toString(); });

    result.on("close", (code) => {
      let errors = 0;
      let warnings = 0;
      try {
        const data = JSON.parse(stdout || "[]");
        const list = Array.isArray(data) ? data : [data];
        for (const file of list) {
          for (const msg of file.messages || []) {
            if (msg.severity === 2) errors++;
            else if (msg.severity === 1) warnings++;
          }
        }
      } catch {
        if (code !== 0) errors = 1;
      }
      resolve({ code: code ?? 1, errors, warnings });
    });
  });
}

async function main() {
  let totalErrors = 0;
  let totalWarnings = 0;
  const results = [];

  // Frontend: usa config próprio (Next.js)
  console.log("\n🔍 Lint frontend...\n");
  const frontend = await runLint(path.join(ROOT, "frontend"), ["."]);
  results.push({ name: "frontend", ...frontend });
  totalErrors += frontend.errors;
  totalWarnings += frontend.warnings;

  // Backend, tests, agents, scripts: usa root eslint.config.mjs
  console.log("\n🔍 Lint backend, tests, agents, scripts...\n");
  const root = await runLint(ROOT, ["backend/", "tests/", "agents/", "scripts/"]);
  results.push({ name: "backend+tests+agents", ...root });
  totalErrors += root.errors;
  totalWarnings += root.warnings;

  console.log("─".repeat(50));
  console.log("📊 RESUMO DO LINT");
  console.log("─".repeat(50));
  for (const r of results) {
    console.log(`   ${r.name}: ${r.errors} erros, ${r.warnings} warnings`);
  }
  console.log("─".repeat(50));
  console.log(`   Total:   ${totalErrors} erros, ${totalWarnings} warnings`);
  console.log("─".repeat(50));

  if (totalErrors > 0) {
    console.log("\n❌ Corrija os erros antes de fazer commit.");
    console.log("   Execute 'npm run lint:all' para ver os detalhes.\n");
    process.exit(1);
  }

  if (totalWarnings > 0) {
    console.log("\n⚠️  Há warnings. Considere corrigir antes de fazer commit.\n");
    process.exit(0);
  }

  console.log("\n✅ Lint OK! Pode fazer commit.\n");
  process.exit(0);
}

main();
