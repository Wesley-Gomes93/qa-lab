import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = new McpServer({
  name: "qa-lab-mcp",
  version: "1.0.0",
});

function runCypressTests({ suite } = {}) {
  const testsDir = path.resolve(__dirname, "../tests");

  return new Promise((resolve) => {
    const args = ["test"];

    // Futuramente você pode usar `suite` para passar tags/ambientes específicos via env.
    const child = spawn("npm", args, {
      cwd: testsDir,
      stdio: "inherit",
      shell: process.platform === "win32",
      env: {
        ...process.env,
        TEST_SUITE: suite ?? "",
      },
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
        .describe("Nome da suíte ou perfil de testes, por exemplo: 'smoke'."),
    }),
    outputSchema: z.object({
      status: z.enum(["passed", "failed"]),
      message: z.string(),
      exitCode: z.number(),
    }),
  },
  async ({ suite }) => {
    const { code } = await runCypressTests({ suite });
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

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Erro no servidor MCP:", err);
  process.exit(1);
});
