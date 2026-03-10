/**
 * Test Writer Agent – Fluxo completo com LLM
 *
 * 1. Ler o projeto (read_project)
 * 2. Sugerir e criar teste (generate_tests + write_test)
 * 3. Rodar teste (run_tests)
 * 4. Verificar se passou
 * 5. Reportar resultado
 *
 * Uso:
 *   node test-writer-agent.js                         → fluxo interativo (pergunta o que testar)
 *   node test-writer-agent.js "healthcheck da API"    → gera e roda teste para o pedido
 *   node test-writer-agent.js --suite api --request "POST /auth/register"
 *
 * Requer: OPENAI_API_KEY ou QA_LAB_LLM_API_KEY no .env (raiz do projeto)
 */
import { config } from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MCP_SERVER_PATH = path.join(__dirname, "mcp-server", "server.js");
const PROJECT_ROOT = path.resolve(__dirname, "..");

// Carrega .env da raiz do projeto (antes de conectar ao MCP)
config({ path: path.join(PROJECT_ROOT, ".env") });

const HAS_LLM_KEY =
  process.env.OPENAI_API_KEY ||
  process.env.QA_LAB_LLM_API_KEY ||
  process.env.GROQ_API_KEY ||
  process.env.GEMINI_API_KEY;
if (!HAS_LLM_KEY && process.argv[2]) {
  console.error("\n[Test Writer Agent] Nenhuma API key configurada.");
  console.error("  Adicione no .env uma destas (todas têm plano gratuito):");
  console.error("    GROQ_API_KEY=...   → https://console.groq.com/keys");
  console.error("    GEMINI_API_KEY=... → https://aistudio.google.com/apikey");
  console.error("    OPENAI_API_KEY=... → https://platform.openai.com/api-keys\n");
  process.exit(1);
}

function getStructured(result) {
  return result?.structuredContent ?? (result?.content?.[0]?.type === "text" ? {} : null);
}

async function main() {
  const userRequest = process.argv[2] || "";
  const args = process.argv.slice(2);
  const suiteIndex = args.indexOf("--suite");
  const requestIndex = args.indexOf("--request");
  const suite = suiteIndex >= 0 ? args[suiteIndex + 1] || "api" : "api";
  const request = requestIndex >= 0 ? args[requestIndex + 1] : userRequest;

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

    console.log("\n[Test Writer Agent] Fluxo: ler projeto → sugerir teste → criar → rodar → verificar\n");

    // 1. Ler projeto
    console.log("1. Lendo projeto...");
    const readResult = await client.callTool({ name: "read_project", arguments: {} });
    const readData = getStructured(readResult);
    if (!readData?.ok) {
      console.error("Erro ao ler projeto:", readData?.error || "desconhecido");
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

    // 2. Gerar teste (LLM)
    const prompt = request || "gere um teste de API para GET /health (healthcheck)";
    console.log("2. Gerando teste com LLM...");
    console.log(`   Pedido: ${prompt}\n`);

    const genResult = await client.callTool({
      name: "generate_tests",
      arguments: { context, userRequest: prompt, target: "api", suite },
    });
    const genData = getStructured(genResult);
    if (!genData?.ok || !genData.specContent) {
      console.error("Erro ao gerar teste:", genData?.error || "LLM não retornou código");
      await client.close();
      process.exit(1);
    }

    const fileName = genData.suggestedFileName || `api-${Date.now()}`;
    console.log(`   → Spec gerado (${genData.specContent.length} chars)\n`);

    // 3. Escrever teste
    console.log("3. Escrevendo arquivo...");
    const writeResult = await client.callTool({
      name: "write_test",
      arguments: { suite, name: fileName, content: genData.specContent },
    });
    const writeData = getStructured(writeResult);
    if (!writeData?.ok) {
      console.error("Erro ao gravar:", writeData?.error);
      await client.close();
      process.exit(1);
    }
    console.log(`   → ${writeData.path}\n`);

    // 4. Rodar teste
    const specPath = `cypress/e2e/${suite}/${fileName.replace(/\.cy\.js$/, "")}.cy.js`;
    console.log("4. Rodando teste...");
    const runResult = await client.callTool({
      name: "run_tests",
      arguments: { spec: specPath },
    });
    const runData = getStructured(runResult);
    const passed = runData?.status === "passed" && runData?.exitCode === 0;

    // 5. Reportar
    console.log("\n5. Resultado:");
    if (passed) {
      console.log("   ✓ Teste passou. Tudo certo.");
    } else {
      console.log("   ✗ Teste falhou. Verifique o output acima.");
      console.log("   Use: npm run agent:analyze-failures para sugestões de correção.");
    }

    console.log("\n[Test Writer Agent] Fim.\n");
    await client.close();
    process.exit(passed ? 0 : 1);
  } catch (err) {
    console.error("[Test Writer Agent] Erro:", err.message);
    if (client) await client.close().catch(() => {});
    process.exit(1);
  }
}

main();
