#!/usr/bin/env node
/**
 * Load test na API do QA Lab.
 * Usa autocannon para medir req/s, latência e erros.
 * Requer API rodando em localhost:4000 (ou API_URL).
 */
const { spawn } = require("child_process");
const path = require("path");

const API_URL = process.env.API_URL || "http://localhost:4000";
const ROOT = path.resolve(__dirname, "..");

async function main() {
  console.log("\n[Load Test] QA Lab API");
  console.log(`  URL: ${API_URL}`);
  console.log("  Connections: 10, Duration: 10s\n");

  const proc = spawn(
    "npx",
    [
      "autocannon",
      "-c", "10",
      "-d", "10",
      "-m", "GET",
      `${API_URL}/health`,
    ],
    {
      cwd: ROOT,
      stdio: "inherit",
      shell: true,
    }
  );

  proc.on("close", (code) => {
    process.exit(code || 0);
  });
}

main().catch((err) => {
  console.error("[Load Test] Erro:", err.message);
  console.error("  Instale: npm install -g autocannon  ou  npx autocannon");
  process.exit(1);
});
