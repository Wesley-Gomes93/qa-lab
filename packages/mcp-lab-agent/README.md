# mcp-lab-agent

MCP + agentes de QA para o Cursor. Inclui todas as ferramentas: `run_tests`, `read_project`, `generate_tests`, `analyze_failures`, `suggest_fix`, etc.

## Uso no Cursor

1. Clone o [qa-lab](https://github.com/Wesley-Gomes93/qa-lab) (o MCP precisa da estrutura do projeto).
2. Configure em **Cursor Settings** → **MCP** (ou `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "qa-lab": {
      "command": "npx",
      "args": ["-y", "mcp-lab-agent"],
      "cwd": "/CAMINHO/ABSOLUTO/para/qa-lab"
    }
  }
}
```

3. Reinicie o Cursor. Na primeira vez o npx baixa o pacote e conecta.

## Via GitHub (sem publicar no npm)

Se o pacote ainda não estiver no npm, use direto do repositório:

```json
{
  "mcpServers": {
    "qa-lab": {
      "command": "npx",
      "args": ["-y", "github:Wesley-Gomes93/qa-lab"],
      "cwd": "/CAMINHO/ABSOLUTO/para/qa-lab"
    }
  }
}
```

## O que o MCP oferece

- **run_tests** — Executa Cypress ou Playwright
- **read_project** — Lê estrutura (rotas, specs, helpers)
- **generate_tests** — Gera specs com LLM (requer API key)
- **write_test** — Escreve arquivo de teste
- **get_users_summary** — Resumo dos usuários no banco
- **clean_test_users** — Remove usuários de teste
- **analyze_failures** — Analisa falhas do Cypress
- **suggest_fix** — Sugere correções
- **create_bug_report** — Gera relatório de bug

## Pré-requisitos

- Node.js 18+
- Projeto qa-lab clonado (cwd deve apontar para a raiz do clone)
- Backend e frontend rodando (para run_tests, get_users_summary)

## Publicar no npm

```bash
cd packages/mcp-lab-agent
npm run build
npm publish
```

Se o nome `mcp-lab-agent` estiver em uso, use escopo: `@seu-usuario/mcp-lab-agent`.
