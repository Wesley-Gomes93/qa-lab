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
      const files = [];
      try {
        const data = JSON.parse(stdout || "[]");
        const list = Array.isArray(data) ? data : [data];
        for (const file of list) {
          if (!file.filePath) continue;
          const msgs = file.messages || [];
          for (const msg of msgs) {
            if (msg.severity === 2) errors++;
            else if (msg.severity === 1) warnings++;
          }
          if (msgs.length > 0) files.push({ filePath: file.filePath, messages: msgs });
        }
      } catch {
        if (code !== 0) errors = 1;
      }
      resolve({ code: code ?? 1, errors, warnings, files });
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

  // Backend, tests, agents, scripts, qa-extended-lab: usa root eslint.config.mjs
  console.log("\n🔍 Lint backend, tests, agents, scripts, qa-extended-lab...\n");
  const root = await runLint(ROOT, [
    "backend/",
    "tests/",
    "agents/",
    "scripts/",
    "qa-extended-lab/",
  ]);
  results.push({ name: "backend+tests+agents+qa-extended-lab", ...root });
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

  if (totalErrors > 0 || totalWarnings > 0) {
    console.log("\n📁 Detalhes:\n");
    for (const r of results) {
      for (const f of r.files || []) {
        const relPath = path.relative(ROOT, f.filePath);
        for (const msg of f.messages) {
          const tipo = msg.severity === 2 ? "erro" : "warning";
          const linha = msg.line ? `:${msg.line}` : "";
          const col = msg.column ? `:${msg.column}` : "";
          console.log(`   ${relPath}${linha}${col}  [${tipo}] ${msg.ruleId || "?"}: ${msg.message}`);
        }
      }
    }
    console.log("");
  }

  if (totalErrors > 0) {
    console.log("❌ Corrija os erros antes de fazer commit.\n");
    process.exit(1);
  }

  if (totalWarnings > 0) {
    console.log("⚠️  Há warnings. Considere corrigir antes de fazer commit.\n");
    process.exit(0);
  }

  console.log("\n✅ Lint OK! Pode fazer commit.\n");
  process.exit(0);
}

main();
