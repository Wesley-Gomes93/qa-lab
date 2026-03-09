/**
 * AI QA Engineer – Failure Analyzer Agent
 *
 * Fluxo: run_tests → (se falhou) analyze_failures → suggest_fix
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MCP_SERVER_PATH = path.join(__dirname, "mcp-server", "server.js");
const PROJECT_ROOT = path.resolve(__dirname, "..");
const SPEC_BASE = path.join(PROJECT_ROOT, "tests", "cypress", "e2e");

function getStructured(result) {
  return result?.structuredContent ?? (result?.content?.[0]?.type === "text" ? {} : null);
}

async function main() {
  const suiteOrSpec = process.argv[2] || "all";
  const isSpec = suiteOrSpec.endsWith(".cy.js") || suiteOrSpec.includes("/");

  const transport = new StdioClientTransport({
    command: "node",
    args: [MCP_SERVER_PATH],
    cwd: PROJECT_ROOT,
  });

  const client = new Client(
    { name: "qa-lab-failure-analyzer", version: "1.0.0" },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);
    console.log("[AI QA Engineer] Conectado ao MCP. Rodando testes...\n");

    const runArgs = isSpec
      ? { spec: suiteOrSpec.startsWith("cypress/") ? suiteOrSpec : `cypress/e2e/${suiteOrSpec}` }
      : { suite: suiteOrSpec };

    const runResult = await client.callTool({
      name: "run_tests",
      arguments: runArgs,
    });

    const runData = getStructured(runResult);
    const exitCode = runData?.exitCode ?? 1;
    const runOutput = runData?.runOutput;

    if (exitCode === 0) {
      console.log("\n✓ Testes passaram. Nada a corrigir.");
      await client.close();
      process.exit(0);
      return;
    }

    console.log("\n✗ Testes falharam. Analisando e sugerindo correções...\n");

    if (!runOutput) {
      console.log("(Output do Cypress não capturado. Rode os testes pelo agent para análise completa.)\n");
      await client.close();
      process.exit(1);
      return;
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
    await client.close().catch(() => {});
    process.exit(1);
  }
}

main();
