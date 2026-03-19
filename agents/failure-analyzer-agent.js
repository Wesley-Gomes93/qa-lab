/**
 * AI QA Engineer – Failure Analyzer Agent
 *
 * Fluxo: roda Cypress diretamente (evita timeout MCP) → (se falhou) analyze_failures → suggest_fix
 * Identifica falhas e sugere correções automaticamente.
 *
 * Uso:
 *   node failure-analyzer-agent.js              → roda todos os testes
 *   node failure-analyzer-agent.js admin        → roda suíte admin
 *   node failure-analyzer-agent.js <spec-path>  → roda spec específico
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "dist", "server.js");
const srcPath = path.join(__dirname, "mcp-server", "server.js");
const MCP_SERVER_PATH = fs.existsSync(distPath) ? distPath : srcPath;
const PROJECT_ROOT = path.resolve(__dirname, "..");
const SPEC_BASE = path.join(PROJECT_ROOT, "tests", "cypress", "e2e");
const TESTS_DIR = path.join(PROJECT_ROOT, "tests");

const SPEC_BY_SUITE = {
  admin: "cypress/e2e/admin/**/*.cy.js",
  auth: "cypress/e2e/auth/**/*.cy.js",
  api: "cypress/e2e/api/**/*.cy.js",
  dashboard: "cypress/e2e/dashboard/**/*.cy.js",
  ui: "cypress/e2e/ui/**/*.cy.js",
  performance: "cypress/e2e/performance/**/*.cy.js",
};

/** Roda Cypress diretamente (evita timeout MCP de 60s). */
function runCypressDirectly(suiteOrSpec) {
  const isSpec = suiteOrSpec.endsWith(".cy.js") || suiteOrSpec.includes("/");
  const spec = isSpec
    ? (suiteOrSpec.startsWith("cypress/") ? suiteOrSpec : `cypress/e2e/${suiteOrSpec}`)
    : (SPEC_BY_SUITE[suiteOrSpec] || null);
  const args = spec ? ["cypress", "run", "--spec", spec] : ["test"];
  const cmd = spec ? "npx" : "npm";

  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      cwd: TESTS_DIR,
      stdio: ["inherit", "pipe", "pipe"],
      shell: process.platform === "win32",
      env: { ...process.env, TEST_SUITE: suiteOrSpec },
    });
    let stdout = "";
    let stderr = "";
    if (child.stdout) child.stdout.on("data", (d) => { stdout += d.toString(); process.stdout.write(d); });
    if (child.stderr) child.stderr.on("data", (d) => { stderr += d.toString(); process.stderr.write(d); });
    child.on("close", (code) => {
      const runOutput = [stdout, stderr].filter(Boolean).join("\n").trim();
      resolve({ code: code ?? 1, runOutput: runOutput || undefined });
    });
  });
}

function getStructured(result) {
  return result?.structuredContent ?? (result?.content?.[0]?.type === "text" ? {} : null);
}

async function main() {
  const suiteOrSpec = process.argv[2] || "all";
  let client;

  const API_BASE = process.env.QA_LAB_API_URL || "http://localhost:4000";
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-qa-lab";

  try {
    console.log("[AI QA Engineer] Limpando usuários de teste...");
    try {
      const cleanRes = await fetch(`${API_BASE}/api/clean-test-users`, {
        method: "POST",
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      });
      const cleanData = await cleanRes.json().catch(() => ({}));
      if (cleanRes.ok) {
        console.log(`  → ${cleanData.deleted ?? 0} usuários removidos.\n`);
      } else {
        console.log("  → API inacessível ou não-autenticado. Prosseguindo sem limpeza.\n");
      }
    } catch {
      console.log("  → Backend pode não estar rodando. Prosseguindo sem limpeza.\n");
    }

    console.log("[AI QA Engineer] Rodando testes (Cypress direto, sem timeout MCP)...\n");

    const { code: exitCode, runOutput } = await runCypressDirectly(suiteOrSpec);

    const transport = new StdioClientTransport({
      command: "node",
      args: [MCP_SERVER_PATH],
      cwd: PROJECT_ROOT,
    });
    client = new Client(
      { name: "qa-lab-failure-analyzer", version: "1.0.0" },
      { capabilities: {} }
    );
    await client.connect(transport);

    if (exitCode === 0) {
      console.log("\n✓ Testes passaram. Nada a corrigir.");
      await client.close();
      process.exit(0);
    }

    // Detecta falhas de ambiente (Cypress não instalado) — não entra na análise de specs
    const cypressMissing = /Cypress binary is missing|cypress\/not-installed|run 'cypress install'/i.test(runOutput || "");
    if (cypressMissing) {
      console.log("\n✗ Cypress não está instalado ou binário ausente.");
      console.log("  Execute: cd tests && npx cypress install");
      console.log("  Depois rode novamente: npm run agent:analyze-failures\n");
      await client.close();
      process.exit(1);
    }

    console.log("\n✗ Testes falharam. Analisando e sugerindo correções...\n");

    if (!runOutput) {
      console.log("(Output do Cypress não capturado.)\n");
      await client.close();
      process.exit(1);
    }

    const analyzeResult = await client.callTool({
      name: "analyze_failures",
      arguments: { runOutput },
    });
    const analyzeData = getStructured(analyzeResult);
    const failures = analyzeData?.failures || [];

    if (failures.length === 0) {
      console.log("Nenhuma falha estruturada detectada. Verifique o output acima.\n");
      await client.close();
      process.exit(1);
      return;
    }

    console.log("─── Análise ───");
    failures.forEach((f, i) => {
      console.log(`\n${i + 1}. Spec: ${f.spec || "?"}`);
      console.log(`   Mensagem: ${f.message || f.title}`);
      console.log(`   Possível causa: ${f.possibleCause || "-"}`);
    });

    let specContent = "";
    const firstSpec = failures[0]?.spec;
    if (firstSpec && firstSpec !== "unknown") {
      const specPath = path.join(SPEC_BASE, firstSpec.replace(/^cypress\/e2e\//, ""));
      if (fs.existsSync(specPath)) {
        specContent = fs.readFileSync(specPath, "utf8");
      }
    }

    const suggestResult = await client.callTool({
      name: "suggest_fix",
      arguments: {
        analysis: { failures },
        specContent: specContent || undefined,
      },
    });
    const suggestData = getStructured(suggestResult);
    const suggestions = suggestData?.suggestions || [];

    console.log("\n\n─── Sugestões de correção ───");
    suggestions.forEach((s, i) => {
      console.log(`\n${i + 1}. ${s.description}`);
      if (s.explanation) console.log(`   Explicação: ${s.explanation}`);
      if (s.patch) console.log(`   Patch/instrução:\n${s.patch}`);
    });

    console.log("\n─── Fim ───");
    console.log("\nAplique as correções acima nos specs e rode os testes novamente.\n");

    await client.close();
    process.exit(1);
  } catch (err) {
    console.error("[AI QA Engineer] Erro:", err.message);
    if (client) await client.close().catch(() => {});
    process.exit(1);
  }
}

main();
