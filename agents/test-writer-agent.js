/**
 * Test Writer Agent – Fluxo completo com LLM
 *
 * 1. Ler o projeto (read_project)
 * 2. Sugerir e criar teste (generate_tests + write_test)
 * 3. Rodar teste(s) (run_tests)
 * 4. Verificar se passou
 * 5. Reportar resultado
 *
 * Uso:
 *   node test-writer-agent.js "healthcheck da API"
 *   node test-writer-agent.js --suite api --request "POST /auth/register"
 *   node test-writer-agent.js --framework both "healthcheck da API"  → gera Cypress + Playwright
 *
 * --framework cypress | playwright | both  (default: cypress)
 *
 * Requer: GROQ_API_KEY, GEMINI_API_KEY ou OPENAI_API_KEY no .env
 */
import { config } from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "dist", "server.js");
const srcPath = path.join(__dirname, "mcp-server", "server.js");
const MCP_SERVER_PATH = fs.existsSync(distPath) ? distPath : srcPath;
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Carrega .env da raiz do projeto (antes de conectar ao MCP)
config({ path: path.join(PROJECT_ROOT, ".env") });

const HAS_LLM_KEY =
  process.env.OPENAI_API_KEY ||
  process.env.QA_LAB_LLM_API_KEY ||
  process.env.GROQ_API_KEY ||
  process.env.GEMINI_API_KEY;
if (!HAS_LLM_KEY && process.argv[2]) {
  console.error("\n[Test Writer Agent] No API key configured.");
  console.error("  Add one of these to .env (Groq and Gemini have free tiers):");
  console.error("    GROQ_API_KEY=...   → https://console.groq.com/keys");
  console.error("    GEMINI_API_KEY=... → https://aistudio.google.com/apikey");
  console.error("    OPENAI_API_KEY=... → https://platform.openai.com/api-keys\n");
  process.exit(1);
}

function getStructured(result) {
  return result?.structuredContent ?? (result?.content?.[0]?.type === "text" ? {} : null);
}

async function main() {
  const args = process.argv.slice(2);
  const suiteIndex = args.indexOf("--suite");
  const requestIndex = args.indexOf("--request");
  const frameworkIndex = args.indexOf("--framework");
  const suite = suiteIndex >= 0 ? args[suiteIndex + 1] || "api" : "api";
  const framework = frameworkIndex >= 0 ? args[frameworkIndex + 1] || "cypress" : "cypress";

  // Request: --request value, ou primeiro arg posicional (não usado por flags)
  const usedByFlags = new Set();
  [suiteIndex, requestIndex, frameworkIndex].forEach((i) => {
    if (i >= 0) {
      usedByFlags.add(i);
      usedByFlags.add(i + 1);
    }
  });
  const positional = args.filter((_, i) => !usedByFlags.has(i));
  const request = requestIndex >= 0 ? args[requestIndex + 1] : positional.join(" ").trim();

  const validFrameworks = ["cypress", "playwright", "both"];
  const fw = validFrameworks.includes(framework) ? framework : "cypress";

  let client;

  try {
    const transport = new StdioClientTransport({
      command: "node",
      args: [MCP_SERVER_PATH],
      cwd: PROJECT_ROOT,
      env: { ...process.env },
    });
    client = new Client(
      { name: "qa-lab-test-writer", version: "1.0.0" },
      { capabilities: {} }
    );
    await client.connect(transport);

    console.log("\n[Test Writer Agent] Flow: read project → suggest test → create → run → verify");
    if (fw === "both") console.log("   Framework: Cypress + Playwright (both)\n");
    else console.log(`   Framework: ${fw}\n`);

    // 1. Ler projeto
    console.log("1. Reading project...");
    const readResult = await client.callTool({ name: "read_project", arguments: {} });
    const readData = getStructured(readResult);
    if (!readData?.ok) {
      console.error("Error reading project:", readData?.error || "unknown");
      await client.close();
      process.exit(1);
    }

    const context = [
      `API Endpoints: ${JSON.stringify(readData.apiEndpoints || [])}`,
      `Specs existentes: ${(readData.existingSpecs || []).join(", ")}`,
      readData.apiDocs ? `\nAPI Docs (trecho):\n${readData.apiDocs}` : "",
      readData.helpers ? `\nHelpers:\n${readData.helpers}` : "",
      readData.constants ? `\nConstants:\n${readData.constants}` : "",
    ].join("\n");

    console.log(`   → ${readData.apiEndpoints?.length || 0} endpoints, ${readData.existingSpecs?.length || 0} specs\n`);

    // 2. Gerar teste(s) (LLM)
    const prompt = request || "gere um teste de API para GET /health (healthcheck)";
    console.log("2. Generating test(s) with LLM...");
    console.log(`   Request: ${prompt}\n`);

    const genResult = await client.callTool({
      name: "generate_tests",
      arguments: { context, userRequest: prompt, target: "api", suite, framework: fw },
    });
    const genData = getStructured(genResult);
    const hasCypress = genData?.ok && genData.specContent;
    const hasPlaywright = genData?.ok && genData.playwrightContent;
    if (!genData?.ok || (!hasCypress && !hasPlaywright)) {
      console.error("Error generating test:", genData?.error || "LLM did not return valid code");
      await client.close();
      process.exit(1);
    }

    const fileName = genData.suggestedFileName || `api-${Date.now()}`;
    if (hasCypress) console.log(`   → Cypress: ${genData.specContent.length} chars`);
    if (hasPlaywright) console.log(`   → Playwright: ${genData.playwrightContent.length} chars`);
    console.log("");

    // 3. Write file(s)
    const writtenPaths = [];
    if (hasCypress) {
      console.log("3a. Writing Cypress spec...");
      const writeResult = await client.callTool({
        name: "write_test",
        arguments: { suite, name: fileName, content: genData.specContent, framework: "cypress" },
      });
      const writeData = getStructured(writeResult);
      if (!writeData?.ok) {
        console.error("Error writing Cypress spec:", writeData?.error);
        await client.close();
        process.exit(1);
      }
      console.log(`    → ${writeData.path}`);
      writtenPaths.push({ framework: "cypress", path: `cypress/e2e/${suite}/${fileName}.cy.js` });
    }
    if (hasPlaywright) {
      console.log("3b. Writing Playwright spec...");
      const writeResult = await client.callTool({
        name: "write_test",
        arguments: { suite, name: fileName, content: genData.playwrightContent, framework: "playwright" },
      });
      const writeResultData = getStructured(writeResult);
      if (!writeResultData?.ok) {
        console.error("Error writing Playwright spec:", writeResultData?.error);
        await client.close();
        process.exit(1);
      }
      console.log(`    → ${writeResultData.path}`);
      writtenPaths.push({ framework: "playwright", path: `playwright/e2e/${suite}/${fileName}.spec.js` });
    }
    console.log("");

    // 4. Run test(s)
    const runResults = [];
    let allPassed = true;
    for (const { framework: f, path: specPath } of writtenPaths) {
      console.log(`4. Running ${f}...`);
      const runResult = await client.callTool({
        name: "run_tests",
        arguments: { spec: specPath, framework: f },
      });
      const runData = getStructured(runResult);
      const passed = runData?.status === "passed" && runData?.exitCode === 0;
      if (!passed) allPassed = false;
      const metrics = runData?.metrics || {};
      runResults.push({
        framework: f,
        spec: specPath,
        passed,
        testsTotal: metrics.testsTotal ?? 0,
        testsPassed: metrics.testsPassed ?? 0,
        testsFailed: metrics.testsFailed ?? 0,
        durationSec: metrics.durationSec ?? null,
      });
      console.log(`   ${passed ? "✓" : "✗"} ${f}: ${passed ? "passed" : "failed"}\n`);
    }

    // 5. Report
    console.log("5. Result:");
    if (allPassed) {
      console.log("   ✓ All tests passed.");
    } else {
      console.log("   ✗ Some test(s) failed. Check the output above.");
      console.log("   Use: npm run agent:analyze-failures for fix suggestions.");
    }

    // 6. Resumo (após execução)
    console.log("\n  ═══════════════════════════════════════════════════════════");
    console.log("  RESUMO DA EXECUÇÃO");
    console.log("  ═══════════════════════════════════════════════════════════");
    console.log(`  Prompt:     ${prompt}`);
    console.log(`  Framework:  ${fw === "both" ? "Cypress + Playwright" : fw}`);
    if (runResults.length === 1) {
      const r = runResults[0];
      console.log(`  Arquivo:    ${r.spec}`);
      console.log(`  Cenários:   ${r.testsTotal || "—"} (${r.testsPassed ?? 0} ✓, ${r.testsFailed ?? 0} ✗)`);
      console.log(`  Tempo:      ${r.durationSec != null ? `${r.durationSec.toFixed(1)}s` : "—"}`);
      console.log(`  Resultado:  ${r.passed ? "✓ Passou" : "✗ Falhou"}`);
    } else {
      console.log("  Arquivos e resultado:");
      runResults.forEach((r) => {
        console.log(`    • ${r.framework}: ${r.spec}`);
        console.log(`      Cenários: ${r.testsTotal || "—"} (${r.testsPassed ?? 0} ✓, ${r.testsFailed ?? 0} ✗)`);
        console.log(`      Tempo: ${r.durationSec != null ? `${r.durationSec.toFixed(1)}s` : "—"}`);
        console.log(`      → ${r.passed ? "✓ Passou" : "✗ Falhou"}`);
      });
      const [cy, pw] = runResults;
      if (cy && pw && cy.durationSec != null && pw.durationSec != null && cy.durationSec > 0 && pw.durationSec > 0) {
        const ratio = cy.durationSec / pw.durationSec;
        const faster = ratio >= 1.05 ? "Playwright" : ratio <= 0.95 ? "Cypress" : null;
        if (faster) {
          const mult = faster === "Playwright" ? ratio : 1 / ratio;
          console.log(`  Métrica:    ${faster} foi ${mult.toFixed(1)}x mais rápido que ${faster === "Playwright" ? "Cypress" : "Playwright"}`);
        }
      }
      console.log(`  Geral:      ${allPassed ? "✓ Todos passaram" : "✗ Algum(ns) falharam"}`);
    }
    if (!allPassed) {
      console.log("  Próximo:    npm run agent:analyze-failures ou revise o spec gerado.");
    }
    console.log("  ═══════════════════════════════════════════════════════════\n");
    console.log("[Test Writer Agent] Done.\n");
    await client.close();
    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error("[Test Writer Agent] Error:", err.message);
    if (client) await client.close().catch(() => {});
    process.exit(1);
  }
}

main();
