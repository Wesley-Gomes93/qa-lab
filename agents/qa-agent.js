/**
 * Agente de QA que se conecta ao MCP server (qa-lab-mcp) e invoca ferramentas.
 * Comando run_tests: menu interativo para escolher qual teste rodar.
 *
 * Uso:
 *   node qa-agent.js                    → lista ferramentas
 *   node qa-agent.js run_tests           → menu interativo e executa o teste escolhido
 *   node qa-agent.js run_tests --suite api  → modo demo: roda suite API direto (sem menu)
 *   node qa-agent.js run_tests --spec cypress/e2e/api/api-health.cy.js  → roda spec específico
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import readline from "node:readline";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distPath = path.join(__dirname, "dist", "server.js");
const srcPath = path.join(__dirname, "mcp-server", "server.js");
const MCP_SERVER_PATH = fs.existsSync(distPath) ? distPath : srcPath;
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
  {
    id: "performance",
    label: "Performance – TICTAC (caminho crítico)",
    desc: "Teste de performance: tempo de carregamento da página, healthcheck da API, tempo até formulário visível e até dashboard após login.",
  },
];

/** Descrições em português para cada arquivo de teste (submenu "Rodar apenas um arquivo"). */
const SPEC_DESCRIPTIONS = {
  "admin/admin-dashboard-editar-idade-id1.cy.js": "Admin: editar idade do usuário id 1 (valor entre 18 e 80)",
  "admin/admin-dashboard-editar-idade-id2.cy.js": "Admin: editar idade do usuário id 2 (valor entre 18 e 80)",
  "admin/admin-dashboard-editar-idade-id3.cy.js": "Admin: editar idade do usuário id 3 (valor entre 18 e 80)",
  "admin/admin-dashboard-excluir-inativo.cy.js": "Admin: excluir um cadastro inativo",
  "admin/admin-dashboard-filtro-usuario-inativo.cy.js": "Admin: pesquisar usuário inativo pelo filtro",
  "admin/admin-dashboard-idade-inativo.cy.js": "Admin: suite completa (idade, validação, inativo, filtro, exclusão)",
  "admin/admin-dashboard-status-inativo.cy.js": "Admin: alterar status de um usuário para inativo",
  "admin/admin-dashboard-validacao-idade.cy.js": "Admin: mensagem quando idade fora do range 18–80",
  "api/api-health.cy.js": "API: healthcheck (status ok)",
  "api/api-users-creation.cy.js": "API: criar 2 usuários e verificar persistência",
  "api/api-delete-user.cy.js": "API: excluir usuário via DELETE /users/:id",
  "api/api-clean-test-users.cy.js": "API: limpar usuários de teste (POST /api/clean-test-users)",
  "auth/login-admin.cy.js": "Auth: login como admin e validar dashboard",
  "auth/logout.cy.js": "Auth: logout e voltar para a home",
  "auth/register-and-login.cy.js": "Auth: registrar usuário e fazer login",
  "auth/register-fill-combinations.cy.js": "Auth: preencher formulário de registro (várias combinações)",
  "auth/register-full-flow.cy.js": "Auth: registrar e ver resumo de sucesso",
  "auth/register-title.cy.js": "Auth: título e campos do formulário de registro",
  "ui/ui-elements.cy.js": "UI: validar header, seções, formulários e botões da tela inicial",
  "performance/tictac.cy.js": "Performance: TICTAC – tempo de load, health, form visível e dashboard após login",
};

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
        const desc = SPEC_DESCRIPTIONS[rel] || `Arquivo: ${rel}`;
        files.push({ path: `cypress/e2e/${rel}`, label: rel, desc });
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

/** Pergunta opcionalmente dados para imersão; retorna { registerName?, registerEmail?, registerPassword?, editIdade? }. */
function parseOneLineInput(line) {
  const t = line.trim();
  if (!t || (!t.includes("@") && !t.includes(","))) return null;
  const parts = t.split(",").map((p) => p.trim()).filter(Boolean);
  const hasEmail = parts.some((p) => p.includes("@"));
  if (parts.length >= 3 && hasEmail) {
    const emailIdx = parts.findIndex((p) => p.includes("@"));
    const name = emailIdx > 0 ? parts[0] : parts[0] || "";
    const email = parts[emailIdx] || parts[1];
    const password = parts[emailIdx + 1] || parts[2];
    const idadeStr = parts[emailIdx + 2] || parts[3];
    const editIdade = idadeStr ? parseInt(idadeStr, 10) : undefined;
    const out = {};
    if (name) out.registerName = name;
    if (email) out.registerEmail = email;
    if (password) out.registerPassword = password;
    if (Number.isFinite(editIdade) && editIdade >= 18 && editIdade <= 80) out.editIdade = editIdade;
    return out;
  }
  return null;
}

async function askImmersiveData() {
  const use = await ask("\n  Quer informar dados? Digite 's' para sim (aí pede campo a campo); ou cole numa linha: nome, e-mail, senha, idade. Enter = aleatório.\n  Resposta: ");
  const trimmed = use.trim();
  const parsed = parseOneLineInput(trimmed);
  if (parsed && (parsed.registerName || parsed.registerEmail || parsed.registerPassword)) {
    console.log("\n  Dados usados: nome =", parsed.registerName || "(aleatório)", "| e-mail =", parsed.registerEmail || "(aleatório)", "| senha =", parsed.registerPassword ? "***" : "(aleatório)", "| idade =", parsed.editIdade ?? "(aleatório)");
    return parsed;
  }
  if (trimmed.toLowerCase() !== "s" && trimmed.toLowerCase() !== "sim") return {};

  console.log("\n  Digite o que quiser. Enter = aleatório.\n");
  const registerName = await ask("  Nome (registro): ");
  const registerEmail = await ask("  E-mail (registro/login): ");
  const registerPassword = await ask("  Senha (registro/login): ");
  const idadeStr = await ask("  Idade (18–80, para testes de edição no admin): ");
  const editIdade = idadeStr === "" ? undefined : parseInt(idadeStr, 10);
  const out = {};
  if (registerName) out.registerName = registerName;
  if (registerEmail) out.registerEmail = registerEmail;
  if (registerPassword) out.registerPassword = registerPassword;
  if (Number.isFinite(editIdade) && editIdade >= 18 && editIdade <= 80) out.editIdade = editIdade;
  return out;
}

async function showMenuAndRun(client, immersive = {}) {
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
  console.log(`     → Encerra o agente sem executar nenhum teste.`);
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
      arguments: { suite, ...immersive },
    });
    return result;
  }

  if (num === suiteStart) {
    console.log("\n  ═══════════════════════════════════════════════════════════");
    console.log("  Escolha um arquivo de teste");
    console.log("  Cada número roda somente esse teste. Leia a descrição e digite o número.");
    console.log("  ═══════════════════════════════════════════════════════════\n");
    specs.forEach((s, idx) => {
      console.log(`  ${idx + 1}. ${s.desc}`);
    });
    console.log("");
  console.log(`  0. Voltar ao menu anterior`);
  console.log(`     → Volta para o menu principal (suítes: Todos, Admin, Auth, API, UI, ou um arquivo).`);
  console.log("");
  console.log("  ───────────────────────────────────────────────────────────");
  const subChoice = await ask("\n  Digite o número do teste e pressione Enter: ");
    const subNum = parseInt(subChoice, 10);
    if (subNum === 0 || Number.isNaN(subNum) || subNum < 1 || subNum > specs.length) {
      console.log("  Voltando ao menu anterior.");
      return showMenuAndRun(client, immersive);
    }
    const spec = specs[subNum - 1];
    console.log(`\n  Executando: ${spec.desc}\n`);
    const result = await client.callTool({
      name: "run_tests",
      arguments: { spec: spec.path, ...immersive },
    });
    return result;
  }

  console.log("  Opção inválida. Leia a lista acima, escolha um número (0 a " + (SUITES.length + 1) + ") e tente de novo.");
  return showMenuAndRun(client, immersive);
}

function parseRunTestsArgs() {
  const args = process.argv.slice(2);
  const suiteIdx = args.indexOf("--suite");
  const specIdx = args.indexOf("--spec");
  const suite = suiteIdx >= 0 ? args[suiteIdx + 1] : null;
  const spec = specIdx >= 0 ? args[specIdx + 1] : null;
  return { suite, spec };
}

async function runTestsDirect(client, { suite, spec }, immersive = {}) {
  const suiteId = suite || "all";
  const specPath = spec || null;
  const suiteObj = SUITES.find((s) => s.id === suiteId);
  const label = specPath ? specPath : suiteObj?.label || suiteId;
  console.log(`\n  [demo] Executando: ${label}\n`);
  const result = await client.callTool({
    name: "run_tests",
    arguments: { suite: specPath ? undefined : suiteId, spec: specPath, ...immersive },
  });
  return result;
}

async function main() {
  const task = process.argv[2] || "list";
  const runTestsArgs = parseRunTestsArgs();

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
      console.log("\n  ═══════════════════════════════════════════════════════════");
      console.log("  Ferramentas disponíveis");
      console.log("  Leia o que cada uma faz; para usar, rode: node qa-agent.js <nome_da_ferramenta>");
      console.log("  ═══════════════════════════════════════════════════════════\n");
      tools.forEach((t) => {
        console.log(`  • ${t.name}`);
        console.log(`    → ${t.description || "Sem descrição."}`);
        console.log("");
      });
      console.log("  Exemplo: node qa-agent.js run_tests  (abre o menu para escolher qual teste rodar)");
      console.log("  ───────────────────────────────────────────────────────────\n");
      await client.close();
      return;
    }

    const tool = tools.find((t) => t.name === task);
    if (!tool) {
      console.log(`\n  Ferramenta "${task}" não encontrada.`);
      console.log("  Opções disponíveis:");
      tools.forEach((t) => {
        console.log(`    • ${t.name}  → ${t.description || "Sem descrição."}`);
      });
      console.log("\n  Exemplo: node qa-agent.js run_tests\n");
      await client.close();
      return;
    }

    if (task === "run_tests") {
      // Modo demo (--suite ou --spec): sem menu, roda direto
      if (runTestsArgs.suite || runTestsArgs.spec) {
        const result = await runTestsDirect(client, runTestsArgs, {});
        if (result.isError) {
          console.error("[agent] Erro:", result.content?.[0]?.text ?? result);
          await client.close();
          process.exit(1);
        }
        const text = result.content?.find((c) => c.type === "text")?.text;
        if (text) console.log("\n" + text);
        const exitCode = result.structuredContent?.exitCode ?? 0;
        await client.close();
        process.exit(exitCode === 0 ? 0 : 1);
      }
      const immersive = await askImmersiveData();
      const result = await showMenuAndRun(client, immersive);

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
      if (exitCode === 0) {
        try {
          const summaryResult = await client.callTool({ name: "get_users_summary", arguments: {} });
          if (!summaryResult.isError && summaryResult.content?.[0]?.text) {
            console.log("\n  ─── Resumo do banco (usuários cadastrados) ───");
            console.log(summaryResult.content[0].text);
            console.log("  ─────────────────────────────────────────────\n");
          }
        } catch { /* ignore */ }
      }

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
