import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      stdio: "inherit",
      shell: process.platform === "win32",
      env,
    });

    child.on("close", (code) => {
      resolve({ code: code ?? 1 });
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
    }),
  },
  async ({ suite, spec: specPath, registerName, registerEmail, registerPassword, editIdade }) => {
    const suiteParam = specPath ? undefined : (suite || "all");
    const { code } = await runCypressTests({
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Erro no servidor MCP:", err);
  process.exit(1);
});
