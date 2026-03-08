/**
 * Agente de QA que se conecta ao MCP server (qa-lab-mcp) e invoca ferramentas.
 * Comando run_tests: menu interativo para escolher qual teste rodar.
 *
 * Uso:
 *   node qa-agent.js              → lista ferramentas
 *   node qa-agent.js run_tests    → menu interativo e executa o teste escolhido
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MCP_SERVER_PATH = path.join(__dirname, "mcp-server", "server.js");
const E2E_DIR = path.resolve(__dirname, "..", "tests", "cypress", "e2e");

const SUITES = [
  {
    id: "all",
    label: "Todos os testes",
    desc: "Roda a suíte completa: auth, api, admin e ui (pode demorar mais).",
  },
  {
    id: "admin",
    label: "Admin – painel do administrador",
    desc: "Testes do dashboard admin: editar idade (ids 1–3), validação 18–80, status inativo, filtro de pesquisa e excluir usuário inativo.",
  },
  {
    id: "auth",
    label: "Auth – login, logout e registro",
    desc: "Testes de autenticação: login como admin, logout, registro (título, combinações de campos, fluxo completo e login após registrar).",
  },
  {
    id: "api",
    label: "API – chamadas diretas ao backend",
    desc: "Testes de API: healthcheck e criação de usuários (resposta e persistência).",
  },
  {
    id: "ui",
    label: "UI – elementos da tela inicial",
    desc: "Validação dos elementos do Playground: header, seções, formulários e botões.",
  },
];

function listSpecFiles() {
  const files = [];
  function walk(dir, base = "") {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const rel = base ? `${base}/${e.name}` : e.name;
      if (e.isDirectory()) {
        walk(path.join(dir, e.name), rel);
      } else if (e.isFile() && e.name.endsWith(".cy.js")) {
        files.push({ path: `cypress/e2e/${rel}`, label: rel });
      }
    }
  }
  walk(E2E_DIR);
  return files.sort((a, b) => a.label.localeCompare(b.label));
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function showMenuAndRun(client) {
  const specs = listSpecFiles();

  console.log("\n  ═══════════════════════════════════════════════════════════");
  console.log("  O que você quer rodar?");
  console.log("  Leia o que cada opção faz e digite o número da opção desejada.");
  console.log("  ═══════════════════════════════════════════════════════════\n");
  let i = 0;
  SUITES.forEach((s) => {
    i += 1;
    console.log(`  ${i}. ${s.label}`);
    console.log(`     → ${s.desc}`);
    console.log("");
  });
  const suiteStart = i + 1;
  console.log(`  ${suiteStart}. Rodar apenas um arquivo de teste`);
  console.log(`     → Abre uma lista com cada arquivo .cy.js; você escolhe um e só esse arquivo é executado.`);
  console.log("");
  console.log(`  0. Sair (não roda nenhum teste)`);
  console.log("");
  console.log("  ───────────────────────────────────────────────────────────");

  const choice = await ask("\n  Digite o número da opção e pressione Enter: ");
  const num = parseInt(choice, 10);

  if (choice === "0" || Number.isNaN(num)) {
    console.log("  Saindo. Nenhum teste foi executado.");
    return { isError: false, structuredContent: { exitCode: 0 } };
  }

  if (num >= 1 && num <= SUITES.length) {
    const suite = SUITES[num - 1].id;
    console.log(`\n  Executando: ${SUITES[num - 1].label}\n`);
    const result = await client.callTool({
      name: "run_tests",
      arguments: { suite },
    });
    return result;
  }

  if (num === suiteStart) {
    console.log("\n  ═══════════════════════════════════════════════════════════");
    console.log("  Escolha um arquivo de teste");
    console.log("  Cada número roda somente esse arquivo. Digite o número e Enter.");
    console.log("  ═══════════════════════════════════════════════════════════\n");
    specs.forEach((s, idx) => {
      console.log(`  ${idx + 1}. ${s.label}`);
    });
    console.log("");
    console.log(`  0. Voltar ao menu anterior`);
    console.log("");
    console.log("  ───────────────────────────────────────────────────────────");
    const subChoice = await ask("\n  Digite o número do arquivo e pressione Enter: ");
    const subNum = parseInt(subChoice, 10);
    if (subNum === 0 || Number.isNaN(subNum) || subNum < 1 || subNum > specs.length) {
      console.log("  Voltando ao menu anterior.");
      return showMenuAndRun(client);
    }
    const spec = specs[subNum - 1];
    console.log(`\n  Executando apenas: ${spec.label}\n`);
    const result = await client.callTool({
      name: "run_tests",
      arguments: { spec: spec.path },
    });
    return result;
  }

  console.log("  Opção inválida. Digite um número da lista acima.");
  return showMenuAndRun(client);
}

async function main() {
  const task = process.argv[2] || "list";

  const transport = new StdioClientTransport({
    command: "node",
    args: [MCP_SERVER_PATH],
    cwd: path.resolve(__dirname, ".."),
  });

  const client = new Client(
    { name: "qa-lab-agent", version: "1.0.0" },
    { capabilities: {} }
  );

  try {
    await client.connect(transport);
    console.log("[agent] Conectado ao MCP server qa-lab-mcp.");

    const { tools } = await client.listTools();
    if (tools.length === 0) {
      console.log("Nenhuma ferramenta disponível.");
      await client.close();
      return;
    }

    if (task === "list") {
      console.log("\nFerramentas disponíveis:");
      tools.forEach((t) => {
        console.log(`  - ${t.name}: ${t.description || "(sem descrição)"}`);
      });
      await client.close();
      return;
    }

    const tool = tools.find((t) => t.name === task);
    if (!tool) {
      console.log(`Ferramenta "${task}" não encontrada. Use: ${tools.map((t) => t.name).join(", ")}`);
      await client.close();
      return;
    }

    if (task === "run_tests") {
      const result = await showMenuAndRun(client);

      if (result.isError) {
        console.error("[agent] Erro:", result.content?.[0]?.text ?? result);
        await client.close();
        process.exit(1);
      }

      const text = result.content?.find((c) => c.type === "text")?.text;
      if (text) console.log("\n" + text);
      if (result.structuredContent) {
        console.log("\n[resultado]", JSON.stringify(result.structuredContent, null, 2));
      }

      const exitCode = result.structuredContent?.exitCode ?? 0;
      await client.close();
      process.exit(exitCode === 0 ? 0 : 1);
      return;
    }

    console.log(`[agent] Chamando ferramenta: ${tool.name}\n`);
    const result = await client.callTool({
      name: tool.name,
      arguments: {},
    });

    if (result.isError) {
      console.error("[agent] Erro:", result.content?.[0]?.text ?? result);
      await client.close();
      process.exit(1);
    }

    const text = result.content?.find((c) => c.type === "text")?.text;
    if (text) console.log(text);
    if (result.structuredContent) {
      console.log("\n[resultado estruturado]", JSON.stringify(result.structuredContent, null, 2));
    }

    const exitCode = result.structuredContent?.exitCode ?? 0;
    await client.close();
    process.exit(exitCode === 0 ? 0 : 1);
  } catch (err) {
    console.error("[agent] Falha:", err.message);
    await client.close().catch(() => {});
    process.exit(1);
  }
}

main();
