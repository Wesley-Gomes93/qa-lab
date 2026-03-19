# Configurar QA Lab MCP no Cursor

O servidor MCP do QA Lab expõe ferramentas (run_tests, read_project, generate_tests, etc.) que o Cursor pode usar.

## Config já incluída no projeto

O repositório já inclui **`.cursor/mcp.json`** com a configuração do MCP. Ao clonar e abrir o projeto no Cursor, o MCP é detectado automaticamente — o `cwd` usa `${workspaceFolder}` e aponta para a raiz do projeto.

**Fluxo:** clone → abra no Cursor → reinicie se necessário → as ferramentas ficam disponíveis no chat.

**Nota:** O qa-lab usa o pacote **`qa-lab-agent-mcp`** (https://github.com/Wesley-Gomes93/qa-lab-agent-mcp), que é genérico e funciona em qualquer projeto. Se quiser usar em outro projeto, basta configurar o MCP com o mesmo comando e `cwd` do projeto.

---

## 1. Build do MCP (só para uso local)

Na raiz do projeto:

```bash
npm run agents:install
npm run agents:build
```

O build usa TSUP e gera `agents/dist/server.js` (bundle único com todas as dependências).

## 2. Configurar no Cursor

O projeto já inclui **`.cursor/mcp.json`** no repositório. Ao clonar e abrir no Cursor, o MCP usa `cwd: "${workspaceFolder}"`, que o Cursor substitui pelo caminho do projeto — **não é preciso configurar o cwd manualmente**.

A config atual usa `mcp-lab-agent` (quando publicado no npm). Se ainda não estiver publicado, altere em `.cursor/mcp.json` para:

```json
"args": ["-y", "github:Wesley-Gomes93/qa-lab"]
```

### Opção A: via npx mcp-lab-agent (após publicar no npm)

O `.cursor/mcp.json` já está configurado com:

```json
{
  "mcpServers": {
    "qa-lab": {
      "command": "npx",
      "args": ["-y", "mcp-lab-agent"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

**Fluxo:** clone → abrir no Cursor → pronto. O `cwd` é preenchido automaticamente.

### Opção A2: via npx do GitHub (sem publicar no npm)

Use direto do repositório. Basta ter o projeto **clonado** — o `cwd` deve ser o caminho do clone:

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

**Fluxo:** clone → configure o MCP → pronto. Na primeira execução o npx baixa e roda o build (postinstall). Depois usa o cache.

### Opção B: via caminho local (após clone)

```json
{
  "mcpServers": {
    "qa-lab": {
      "command": "node",
      "args": ["/CAMINHO/ABSOLUTO/para/qa-lab/agents/dist/server.js"],
      "cwd": "/CAMINHO/ABSOLUTO/para/qa-lab"
    }
  }
}
```

**Importante:** Substitua `/CAMINHO/ABSOLUTO/para/qa-lab` pelo caminho real do seu clone (ex.: `/Users/seu-usuario/Desktop/qa-lab`).

### Opção C: via bin `qa-lab`

Se você fez `npm link` ou instalou o pacote globalmente:

```json
{
  "mcpServers": {
    "qa-lab": {
      "command": "qa-lab",
      "cwd": "/CAMINHO/ABSOLUTO/para/qa-lab"
    }
  }
}
```

## 3. Variáveis de ambiente (opcional)

Para `.env` na raiz do projeto:

- **OPENAI_API_KEY** ou **QA_LAB_LLM_API_KEY** – para `generate_tests` (OpenAI)
- **GROQ_API_KEY** – Groq (gratuito)
- **GEMINI_API_KEY** – Google Gemini (gratuito)
- **ADMIN_TOKEN** – token de admin para `/users` (default: `admin-qa-lab`)

## 4. Ferramentas disponíveis no Cursor

| Tool | Descrição |
|------|-----------|
| `run_tests` | Executa Cypress ou Playwright |
| `get_users_summary` | Resumo dos usuários no banco |
| `read_project` | Lê estrutura do projeto (rotas, specs, helpers) |
| `generate_tests` | Gera spec via LLM (requer API key) |
| `write_test` | Grava spec em disco |
| `clean_test_users` | Remove usuários @teste.com |
| `analyze_failures` | Analisa output de falhas do Cypress |
| `suggest_fix` | Sugere correções para falhas |
| `create_bug_report` | Gera relatório de bug |

## 5. Pré-requisitos

- Node.js 18+
- Backend e frontend rodando (para run_tests, get_users_summary, etc.)
- Pasta `tests/` com Cypress configurado

## 6. Fluxo recomendado

### Com npx (sem build manual)

1. Clone o repositório: `git clone https://github.com/Wesley-Gomes93/qa-lab.git && cd qa-lab`
2. Configure o MCP no Cursor com a **Opção A** (npx), usando o caminho do clone como `cwd`
3. Reinicie o Cursor — na primeira vez o npx baixa e faz o build
4. Use as ferramentas via chat ou Composer

### Com clone local

1. Clone o repositório e abra no Cursor
2. `npm install` na raiz (o postinstall já roda o build dos agents)
3. Configure o MCP no Cursor com a **Opção B** (caminho local)
4. Reinicie o Cursor e use as ferramentas

---

## 7. Publicar mcp-lab-agent no npm (mantenedores)

Para que outras pessoas usem `npx -y mcp-lab-agent`:

```bash
cd packages/mcp-lab-agent
npm run build   # garante dist/ atualizado
npm login       # se necessário
npm publish     # ou npm publish --access public (para escopo)
```

Se o nome `mcp-lab-agent` já estiver em uso no npm, use escopo: `@seu-usuario/mcp-lab-agent` e ajuste o `name` no package.json. Aí a pessoa configuraria: `npx -y @seu-usuario/mcp-lab-agent`.
