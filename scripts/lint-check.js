#!/usr/bin/env node
/**
 * QA Lab - Verificação de Lint com Resumo
 * Roda o ESLint no frontend e exibe contagem de erros e warnings.
 * Útil antes de fazer commit.
 *
 * Uso: node scripts/lint-check.js
 *      npm run lint:check (na raiz)
 */

const { spawn } = require("child_process");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const FRONTEND = path.join(ROOT, "frontend");

function runLint() {
  console.log("\n🔍 Verificando lint no frontend...\n");
  return new Promise((resolve) => {
    const result = spawn("npx", ["eslint", ".", "--format", "json"], {
      cwd: FRONTEND,
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
      } catch (_e) {
        if (code !== 0) errors = 1;
      }
      resolve({ code: code ?? 1, errors, warnings });
    });
  });
}

async function main() {
  const { code, errors, warnings } = await runLint();

  console.log("─".repeat(50));
  console.log("📊 RESUMO DO LINT");
  console.log("─".repeat(50));
  console.log(`   Erros:   ${errors}`);
  console.log(`   Warnings: ${warnings}`);
  console.log("─".repeat(50));

  if (errors > 0) {
    console.log("\n❌ Corrija os erros antes de fazer commit.");
    console.log("   Execute 'cd frontend && npm run lint' para ver os detalhes.\n");
    process.exit(1);
  }

  if (warnings > 0) {
    console.log("\n⚠️  Há warnings. Considere corrigir antes de fazer commit.");
    console.log("   Execute 'cd frontend && npm run lint' para ver os detalhes.\n");
    process.exit(code === 0 ? 0 : 1);
  }

  console.log("\n✅ Lint OK! Pode fazer commit.\n");
  process.exit(0);
}

main();
