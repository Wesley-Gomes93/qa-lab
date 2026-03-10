import { config } from "dotenv";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "../..");

// Carrega .env da raiz (para OPENAI_API_KEY / QA_LAB_LLM_API_KEY)
config({ path: path.join(PROJECT_ROOT, ".env") });
const TESTS_DIR = path.join(PROJECT_ROOT, "tests");
const SPEC_BASE = path.join(TESTS_DIR, "cypress", "e2e");

const API_BASE = "http://localhost:4000";
const DEFAULT_ADMIN_TOKEN = "admin-qa-lab";

const server = new McpServer({
  name: "qa-lab-mcp",
  version: "1.0.0",
});

async function getUsersSummary() {
  const token = process.env.ADMIN_TOKEN || DEFAULT_ADMIN_TOKEN;
  try {
    const res = await fetch(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      return { ok: false, error: `API retornou ${res.status}`, users: [], summary: "" };
    }
    const users = await res.json();
    const last = users.slice(-10);
    const lines = last.map((u) => `  id ${u.id} | ${u.name} | ${u.email} | idade ${u.idade ?? "-"} | ativo ${u.ativo !== false ? "Sim" : "Não"}`);
    const summary = `Usuários no banco (últimos ${last.length} de ${users.length}):\n${lines.join("\n")}`;
    return { ok: true, users, last, summary, total: users.length };
  } catch (err) {
    return { ok: false, error: err.message, users: [], summary: `Erro ao consultar API: ${err.message}` };
  }
}

function runCypressTests({ suite, spec: specPath, registerName, registerEmail, registerPassword, editIdade } = {}) {
  const testsDir = path.resolve(__dirname, "../../tests");

  const specBySuite = {
    admin: "cypress/e2e/admin/**/*.cy.js",
    auth: "cypress/e2e/auth/**/*.cy.js",
    api: "cypress/e2e/api/**/*.cy.js",
    ui: "cypress/e2e/ui/**/*.cy.js",
    performance: "cypress/e2e/performance/**/*.cy.js",
  };

  const isAll = !suite || suite === "all";
  const spec = specPath || (!isAll && specBySuite[suite] ? specBySuite[suite] : null);

  const env = {
    ...process.env,
    TEST_SUITE: suite ?? "",
  };
  if (registerName != null && String(registerName).trim()) env.CYPRESS_REGISTER_NAME = String(registerName).trim();
  if (registerEmail != null && String(registerEmail).trim()) env.CYPRESS_REGISTER_EMAIL = String(registerEmail).trim();
  if (registerPassword != null && String(registerPassword).trim()) env.CYPRESS_REGISTER_PASSWORD = String(registerPassword).trim();
  if (editIdade != null && editIdade >= 18 && editIdade <= 80) env.CYPRESS_EDIT_IDADE = String(editIdade);

  return new Promise((resolve) => {
    const args = spec
      ? ["cypress", "run", "--spec", spec]
      : ["test"];
    const cmd = spec ? "npx" : "npm";

    const child = spawn(cmd, args, {
      cwd: testsDir,
      stdio: ["inherit", "pipe", "pipe"],
      shell: process.platform === "win32",
      env,
    });

    let stdout = "";
    let stderr = "";
    if (child.stdout) {
      child.stdout.on("data", (d) => {
        const s = d.toString();
        stdout += s;
        process.stdout.write(s);
      });
    }
    if (child.stderr) {
      child.stderr.on("data", (d) => {
        const s = d.toString();
        stderr += s;
        process.stderr.write(s);
      });
    }

    child.on("close", (code) => {
      const runOutput = [stdout, stderr].filter(Boolean).join("\n").trim();
      resolve({ code: code ?? 1, runOutput: runOutput || undefined });
    });
  });
}

server.registerTool(
  "run_tests",
  {
    title: "Executar testes automatizados",
    description:
      "Executa a suíte de testes automatizados (Cypress) e retorna um resumo em texto e JSON.",
    inputSchema: z.object({
      suite: z
        .string()
        .optional()
        .describe("Suíte: 'all', 'admin', 'auth', 'api', 'ui', 'performance'."),
      spec: z
        .string()
        .optional()
        .describe("Caminho do arquivo de spec (ex: cypress/e2e/admin/admin-dashboard-idade-inativo.cy.js)."),
      registerName: z.string().optional().describe("Nome para testes de registro (env CYPRESS_REGISTER_NAME)."),
      registerEmail: z.string().optional().describe("E-mail para registro/login (env CYPRESS_REGISTER_EMAIL)."),
      registerPassword: z.string().optional().describe("Senha para registro/login (env CYPRESS_REGISTER_PASSWORD)."),
      editIdade: z.number().min(18).max(80).optional().describe("Idade (18-80) para testes de edição no admin (env CYPRESS_EDIT_IDADE)."),
    }),
    outputSchema: z.object({
      status: z.enum(["passed", "failed"]),
      message: z.string(),
      exitCode: z.number(),
      runOutput: z.string().optional().describe("Output do Cypress quando falhou (para analyze_failures)."),
    }),
  },
  async ({ suite, spec: specPath, registerName, registerEmail, registerPassword, editIdade }) => {
    const suiteParam = specPath ? undefined : (suite || "all");
    const { code, runOutput } = await runCypressTests({
      suite: suiteParam,
      spec: specPath,
      registerName,
      registerEmail,
      registerPassword,
      editIdade,
    });
    const passed = code === 0;

    const structured = {
      status: passed ? "passed" : "failed",
      message: passed
        ? "Testes Cypress executados com sucesso."
        : "Falha na execução dos testes Cypress. Verifique os logs.",
      exitCode: code,
      ...(runOutput && !passed && { runOutput }),
    };

    return {
      content: [
        {
          type: "text",
          text: structured.message,
        },
      ],
      structuredContent: structured,
    };
  }
);

server.registerTool(
  "get_users_summary",
  {
    title: "Resumo dos usuários no banco",
    description: "Consulta a API GET /users (admin) e retorna um resumo dos usuários cadastrados no banco. Útil após rodar testes de registro para conferir o que foi criado.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      ok: z.boolean(),
      total: z.number().optional(),
      summary: z.string(),
      error: z.string().optional(),
    }),
  },
  async () => {
    const { ok, total, summary, error } = await getUsersSummary();
    return {
      content: [{ type: "text", text: summary }],
      structuredContent: { ok, total, summary, error },
    };
  }
);

// ----- Limpeza de usuários de teste

async function cleanTestUsers() {
  const token = process.env.ADMIN_TOKEN || DEFAULT_ADMIN_TOKEN;
  try {
    const res = await fetch(`${API_BASE}/api/clean-test-users`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, deleted: 0, error: data.error || res.statusText };
    return { ok: true, deleted: data.deleted ?? 0 };
  } catch (err) {
    return { ok: false, deleted: 0, error: err.message };
  }
}

server.registerTool(
  "clean_test_users",
  {
    title: "Limpar usuários de teste",
    description: "Remove usuários com e-mail @teste.com do banco (mantém admin). Use antes de rodar testes.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      ok: z.boolean(),
      deleted: z.number(),
      error: z.string().optional(),
    }),
  },
  async () => {
    const { ok, deleted, error } = await cleanTestUsers();
    return {
      content: [{ type: "text", text: ok ? `Usuários de teste removidos: ${deleted}` : `Erro: ${error}` }],
      structuredContent: { ok, deleted: deleted ?? 0, error },
    };
  }
);

// ----- read_project: lê e entende a estrutura do projeto

function readProjectStructure() {
  const result = {
    apiEndpoints: [],
    existingSpecs: [],
    helpers: "",
    apiDocs: "",
    backendRoutes: "",
  };

  // API docs
  const apiMd = path.join(PROJECT_ROOT, "docs", "API.md");
  if (fs.existsSync(apiMd)) {
    result.apiDocs = fs.readFileSync(apiMd, "utf8");
  }

  // Backend routes (parse server.js)
  const serverPath = path.join(PROJECT_ROOT, "backend", "server.js");
  if (fs.existsSync(serverPath)) {
    const serverCode = fs.readFileSync(serverPath, "utf8");
    const routeMatches = serverCode.matchAll(/app\.(get|post|put|delete|patch)\s*\(\s*["']([^"']+)["']/g);
    for (const m of routeMatches) {
      result.apiEndpoints.push({ method: m[1].toUpperCase(), path: m[2] });
    }
    result.backendRoutes = serverCode.slice(0, 2500);
  }

  // Existing specs
  const suites = ["api", "auth", "admin", "ui", "performance"];
  for (const suite of suites) {
    const dir = path.join(SPEC_BASE, suite);
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter((f) => f.endsWith(".cy.js"));
      for (const f of files) {
        result.existingSpecs.push(`${suite}/${f}`);
      }
    }
  }

  // Helpers e constants
  const helpersPath = path.join(TESTS_DIR, "cypress", "support", "helpers.js");
  if (fs.existsSync(helpersPath)) {
    result.helpers = fs.readFileSync(helpersPath, "utf8");
  }
  const constantsPath = path.join(TESTS_DIR, "shared", "constants.js");
  if (fs.existsSync(constantsPath)) {
    result.constants = fs.readFileSync(constantsPath, "utf8");
  }
  return result;
}

server.registerTool(
  "read_project",
  {
    title: "Ler e entender o projeto",
    description: "Lê a estrutura do projeto: rotas da API, specs existentes, helpers e documentação. Retorna contexto para gerar testes.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      ok: z.boolean(),
      summary: z.string(),
      apiEndpoints: z.array(z.object({ method: z.string(), path: z.string() })).optional(),
      existingSpecs: z.array(z.string()).optional(),
      error: z.string().optional(),
    }),
  },
  async () => {
    try {
      const data = readProjectStructure();
      const summary = [
        `API Endpoints: ${data.apiEndpoints.map((e) => `${e.method} ${e.path}`).join(", ")}`,
        `Specs existentes: ${(data.existingSpecs || []).join(", ")}`,
        `Helpers e constants disponíveis no resultado.`,
      ].join("\n");
      return {
        content: [{ type: "text", text: summary }],
        structuredContent: {
          ok: true,
          summary,
          apiEndpoints: data.apiEndpoints,
          existingSpecs: data.existingSpecs,
          apiDocs: data.apiDocs?.slice(0, 3000),
          helpers: data.helpers?.slice(0, 1500),
          constants: data.constants?.slice(0, 800),
        },
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Erro: ${err.message}` }],
        structuredContent: { ok: false, summary: "", error: err.message },
      };
    }
  }
);

// ----- write_test: escreve spec no disco

server.registerTool(
  "write_test",
  {
    title: "Escrever arquivo de teste",
    description: "Grava o conteúdo de um spec Cypress em tests/cypress/e2e/{suite}/{nome}.cy.js",
    inputSchema: z.object({
      suite: z.enum(["api", "auth", "admin", "ui", "performance"]).describe("Pasta da suíte."),
      name: z.string().describe("Nome do arquivo sem .cy.js (ex: api-health)."),
      content: z.string().describe("Conteúdo completo do spec Cypress."),
    }),
    outputSchema: z.object({
      ok: z.boolean(),
      path: z.string().optional(),
      error: z.string().optional(),
    }),
  },
  async ({ suite, name, content }) => {
    const safeName = name.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-");
    const fileName = safeName.endsWith(".cy.js") ? safeName : `${safeName}.cy.js`;
    const filePath = path.join(SPEC_BASE, suite, fileName);
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(filePath, content, "utf8");
      return {
        content: [{ type: "text", text: `Arquivo gravado: ${filePath}` }],
        structuredContent: { ok: true, path: filePath },
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Erro ao gravar: ${err.message}` }],
        structuredContent: { ok: false, error: err.message },
      };
    }
  }
);

// ----- AI QA Engineer tools (read PR, generate tests, analyze failures, create bug report)

server.registerTool(
  "read_pr",
  {
    title: "Ler Pull Request",
    description: "Lê o diff ou contexto de um PR (URL ou texto do diff) e retorna resumo dos arquivos alterados para uso pelo Test Generator.",
    inputSchema: z.object({
      prUrl: z.string().optional().describe("URL do PR (ex: GitHub)."),
      diffText: z.string().optional().describe("Texto do diff colado (git diff ou patch)."),
    }),
    outputSchema: z.object({
      ok: z.boolean(),
      summary: z.string(),
      filesChanged: z.array(z.string()).optional(),
      error: z.string().optional(),
    }),
  },
  async ({ prUrl, diffText }) => {
    if (!prUrl && !diffText) {
      return {
        content: [{ type: "text", text: "Forneça prUrl ou diffText. Para integração real: use GitHub API ou git diff e passe o resultado aqui." }],
        structuredContent: { ok: false, summary: "Missing prUrl or diffText", error: "Missing input" },
      };
    }
    const summary = prUrl
      ? `PR URL recebido: ${prUrl}. Para implementação completa: integre com GitHub API (GET /repos/:owner/:repo/pulls/:number/files) e retorne arquivos alterados.`
      : `Diff recebido (${(diffText || "").split("\n").length} linhas). Para implementação completa: parse do diff para extrair arquivos e trechos alterados.`;
    const filesChanged = diffText
      ? [...new Set((diffText.match(/^diff --git a\/(.+?) b\//gm) || []).map((m) => m.replace(/^diff --git a\/(.+?) b\/.*/, "$1")))]
      : [];
    return {
      content: [{ type: "text", text: summary }],
      structuredContent: { ok: true, summary, filesChanged: filesChanged.length ? filesChanged : undefined },
    };
  }
);

server.registerTool(
  "generate_tests",
  {
    title: "Gerar testes com LLM",
    description: "Usa LLM (OPENAI_API_KEY) para gerar spec Cypress a partir do contexto do projeto. Retorna código pronto para write_test.",
    inputSchema: z.object({
      context: z.string().describe("Contexto: resultado de read_project ou descrição do que testar."),
      userRequest: z.string().optional().describe("O que o usuário quer testar (ex: 'healthcheck da API', 'registro de usuário')."),
      target: z.enum(["e2e", "api"]).optional().describe("Alvo: e2e (Cypress) ou api."),
      suite: z.enum(["api", "auth", "admin", "ui", "performance"]).optional().describe("Suíte destino."),
    }),
    outputSchema: z.object({
      ok: z.boolean(),
      specContent: z.string().optional(),
      suggestedFileName: z.string().optional(),
      error: z.string().optional(),
    }),
  },
  async ({ context, userRequest = "", target = "api", suite = "api" }) => {
    try {
      const { callLLM } = await import("../llm.js");
      const systemPrompt = `Você é um engenheiro de QA especializado em Cypress. Gere APENAS o código do spec, sem explicações antes ou depois.
Regras:
- Use require('../../support/helpers') para API_BASE, randomEmail, randomName quando fizer sentido.
- API_BASE vem de helpers; base URL da API é http://localhost:4000.
- Para testes de API: use cy.request() diretamente.
- Mantenha padrão do projeto: describe + it, asserções com expect().
- Não inclua comentários excessivos. Código limpo e funcional.
- Retorne SOMENTE o código JavaScript, sem markdown, sem \`\`\`js.`;

      const userPrompt = `Contexto do projeto QA Lab:
${context.slice(0, 6000)}

O usuário quer: ${userRequest || "gerar teste para o endpoint ou fluxo mais adequado ao contexto"}

Gere um spec Cypress completo (describe + it). Target: ${target}. Suíte: ${suite}.`;

      const specContent = await callLLM(systemPrompt, userPrompt);
      // Remove markdown code block se o LLM incluir
      const cleaned = specContent.replace(/^```(?:js|javascript)?\n?/i, "").replace(/\n?```\s*$/i, "").trim();
      const suggestedFileName = `${suite}-${(userRequest || "novo").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`.slice(0, 50);
      return {
        content: [{ type: "text", text: `Spec gerado (${cleaned.length} chars). Use write_test para gravar.` }],
        structuredContent: { ok: true, specContent: cleaned, suggestedFileName },
      };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Erro ao gerar: ${err.message}` }],
        structuredContent: { ok: false, error: err.message },
      };
    }
  }
);

/** Parse Cypress/Mocha output to extract failures (spec, title, message, selector). */
function parseCypressFailures(runOutput) {
  const failures = [];
  const lines = runOutput.split("\n");

  // AssertionError: Timed out retrying... Expected to find element: `[data-testid="btn-edit-2"]`, but never found it.
  const elementNotFoundRe = /Expected to find element:\s*`([^`]+)`,\s*but never found it/i;
  const specFileRe = /at Context\.eval \(.*?\.\/(.+?)\)|Running:\s+(.+?)(?:\s+\(|\s*$)/;
  const assertErrorRe = /AssertionError:\s*(.+)/;

  let currentSpec = "";
  let currentTitle = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const runningMatch = line.match(/Running:\s+(.+?)(?:\s+\(\d|$)/);
    if (runningMatch) currentSpec = runningMatch[1].trim();

    const specMatch = line.match(/^\s+(\d+\)\s+.+?)\s*$/);
    if (specMatch && currentSpec) currentTitle = specMatch[1].trim();

    const elemMatch = line.match(elementNotFoundRe);
    if (elemMatch) {
      const selector = elemMatch[1];
      failures.push({
        spec: currentSpec || "unknown",
        title: currentTitle || "Element not found",
        message: line.trim(),
        selector,
        possibleCause: `Elemento \`${selector}\` não encontrado. Possíveis causas: id dinâmico, elemento fora da view ou ainda não renderizado.`,
        fixSuggestion: "use_selectors_por_posição_ou_prefixo",
      });
    }

    const assertMatch = line.match(assertErrorRe);
    if (assertMatch && failures.length === 0) {
      const msg = assertMatch[1].trim();
      const elemFromMsg = msg.match(elementNotFoundRe);
      if (elemFromMsg) continue;
      failures.push({
        spec: currentSpec || "unknown",
        title: currentTitle || "Assertion failed",
        message: msg,
        possibleCause: "Erro de asserção. Verifique o valor esperado e o estado do DOM.",
      });
    }
  }

  if (failures.length === 0 && /fail|error|AssertionError/i.test(runOutput)) {
    failures.push({
      spec: "unknown",
      title: "Falha detectada",
      message: lines.filter((l) => /fail|error|Assertion/i.test(l)).slice(0, 3).join(" "),
      possibleCause: "Verifique o stack trace e o spec indicado.",
    });
  }
  return failures;
}

server.registerTool(
  "analyze_failures",
  {
    title: "Analisar falhas de testes",
    description: "Recebe o output do Cypress e retorna análise estruturada (spec, assertion, seletor, possível causa).",
    inputSchema: z.object({
      runOutput: z.string().describe("Saída do Cypress ou resumo das falhas (stack trace, mensagens)."),
    }),
    outputSchema: z.object({
      ok: z.boolean(),
      summary: z.string(),
      failures: z.array(z.object({
        spec: z.string().optional(),
        title: z.string().optional(),
        message: z.string().optional(),
        selector: z.string().optional(),
        possibleCause: z.string().optional(),
        fixSuggestion: z.string().optional(),
      })).optional(),
      error: z.string().optional(),
    }),
  },
  async ({ runOutput }) => {
    const failures = parseCypressFailures(runOutput || "");
    const summary = failures.length
      ? `Encontradas ${failures.length} falha(s). Use suggest_fix para obter correção sugerida.`
      : "Nenhuma falha estruturada detectada no output.";
    return {
      content: [{ type: "text", text: summary + "\n\n" + JSON.stringify(failures, null, 2) }],
      structuredContent: { ok: true, summary, failures: failures.length ? failures : undefined },
    };
  }
);

server.registerTool(
  "suggest_fix",
  {
    title: "Sugerir correção para falhas de teste",
    description: "Recebe análise de falhas e opcionalmente o conteúdo do spec; retorna patch ou instruções para corrigir.",
    inputSchema: z.object({
      analysis: z.union([
        z.string().describe("Output bruto do Cypress ou JSON string da análise."),
        z.object({
          failures: z.array(z.object({
            spec: z.string().optional(),
            selector: z.string().optional(),
            message: z.string().optional(),
            fixSuggestion: z.string().optional(),
          })),
        }),
      ]).describe("Resultado de analyze_failures ou runOutput."),
      specContent: z.string().optional().describe("Conteúdo do arquivo de spec para aplicar sugestão contextual."),
    }),
    outputSchema: z.object({
      ok: z.boolean(),
      suggestions: z.array(z.object({
        spec: z.string().optional(),
        description: z.string(),
        patch: z.string().optional(),
        explanation: z.string().optional(),
      })),
      error: z.string().optional(),
    }),
  },
  async ({ analysis, specContent }) => {
    let failures = [];
    if (typeof analysis === "string") {
      try {
        const parsed = JSON.parse(analysis);
        failures = parsed.failures || [];
      } catch {
        failures = parseCypressFailures(analysis);
      }
    } else if (analysis?.failures) {
      failures = analysis.failures;
    }

    const suggestions = [];
    for (const f of failures) {
      const selector = f.selector;
      const spec = f.spec || "unknown";

      if (selector && /data-testid=["']btn-edit-\d+["']/.test(selector)) {
        const idMatch = selector.match(/btn-edit-(\d+)/);
        const tip = idMatch
          ? `Substitua \`[data-testid="btn-edit-${idMatch[1]}"]\` por seleção por posição na tabela.`
          : "Use seleção por posição (clickEditOnRow, getUserRow) em vez de id fixo.";
        suggestions.push({
          spec,
          description: "Elemento btn-edit-X não encontrado — id dinâmico ou usuário inexistente.",
          patch: specContent && /btn-edit-\d+|get\(.*testid.*btn-edit/.test(specContent)
            ? `// 1. Adicione aos requires: clickEditOnRow, getUserRow (de support/helpers)
// 2. Substitua cy.get('[data-testid="btn-edit-2"]').click() por:
clickEditOnRow(1);  // 1 = primeira linha não-admin, 0 = admin
// 3. Para asserts na linha: getUserRow(1).contains('valor')`
            : tip,
          explanation: "IDs fixos (btn-edit-2, btn-edit-3) quebram quando a ordem ou existência de usuários muda. Use helpers clickEditOnRow(index) e getUserRow(index).",
        });
      } else if (selector && /data-testid=["']btn-delete-\d+["']/.test(selector)) {
        suggestions.push({
          spec,
          description: "Elemento btn-delete-X não encontrado.",
          patch: `// Use seleção por posição: cy.get('tbody tr').eq(index).within(() => cy.get('[data-testid^="btn-delete-"]').click())`,
          explanation: "Evite ids fixos em btn-delete. Prefira [data-testid^=\"btn-delete-\"] dentro da linha.",
        });
      } else if (/Too many elements found|Found '\d+', expected/.test(f.message || "")) {
        suggestions.push({
          spec,
          description: "Too many elements found – seletor genérico ou tabela errada.",
          patch: `// Escopo o seletor à tabela correta: use [data-testid="table-users"] tbody tr para a tabela de usuários.
// Ou para contagem relativa: cy.get(SELECTOR).then($r => { const n = $r.length; ... .should('have.length', n - 1); })`,
          explanation: "Seletor 'tbody tr' pode estar pegando várias tabelas ou a contagem fixa está errada (ex.: banco com muitos registros).",
        });
      } else if (selector) {
        suggestions.push({
          spec,
          description: `Elemento não encontrado: ${selector}`,
          patch: `// Tente: [data-testid^="prefixo"] para match parcial, ou { force: true } se elemento estiver coberto por overlay.`,
          explanation: "Elemento pode não existir, estar oculto ou ter ID/atributo dinâmico.",
        });
      } else {
        suggestions.push({
          spec,
          description: f.message || "Falha detectada",
          patch: "Revise o spec e a stack trace. Considere aumentar timeout ou adicionar cy.wait/cy.intercept.",
          explanation: f.possibleCause || "Causa desconhecida.",
        });
      }
    }

    return {
      content: [{ type: "text", text: JSON.stringify({ ok: true, suggestions }, null, 2) }],
      structuredContent: { ok: true, suggestions },
    };
  }
);

server.registerTool(
  "create_bug_report",
  {
    title: "Criar relatório de bug",
    description: "Gera um bug report (texto/estrutura) a partir da análise de falhas. Integre com LLM para descrição rica.",
    inputSchema: z.object({
      analysisSummary: z.string().describe("Resumo da análise de falhas (saída de analyze_failures)."),
      title: z.string().optional().describe("Título sugerido do bug."),
    }),
    outputSchema: z.object({
      ok: z.boolean(),
      report: z.string(),
      title: z.string().optional(),
      error: z.string().optional(),
    }),
  },
  async ({ analysisSummary, title }) => {
    const report = `## Bug Report\n\n**Título:** ${title || "Falha em testes automatizados"}\n\n**Resumo da análise:**\n${analysisSummary}\n\n---\n*Para relatório rico: envie analysisSummary + contexto para um LLM e formate como issue (steps to reproduce, expected vs actual).*`;
    return {
      content: [{ type: "text", text: report }],
      structuredContent: { ok: true, report, title: title || "Falha em testes automatizados" },
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Erro no servidor MCP:", err);
  process.exit(1);
});
