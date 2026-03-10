# Agentes e MCP – QA Lab

Esta pasta contém o **servidor MCP** (Model Context Protocol) e o **agente de QA** que se conecta a ele para executar ações (por exemplo, rodar os testes Cypress).

## Estrutura

- **`mcp-server/`** – Servidor MCP que expõe ferramentas (tools).
- **`qa-agent.js`** – Cliente/agente com menu interativo para rodar testes (run_tests).
- **`failure-analyzer-agent.js`** – **AI QA Engineer**: roda testes, identifica falhas e sugere correções (run_tests → analyze_failures → suggest_fix).
- **`test-writer-agent.js`** – Fluxo completo com LLM: ler projeto → sugerir teste → criar → rodar → verificar. Requer `OPENAI_API_KEY`.

### Ferramentas MCP disponíveis

| Tool | Descrição |
|------|-----------|
| `run_tests` | Executa Cypress; retorna status, exit code e **runOutput** quando falha (para analyze_failures). |
| `get_users_summary` | Resumo dos usuários no banco (GET /users). |
| `read_project` | Lê estrutura do projeto (rotas API, specs existentes, helpers). |
| `generate_tests` | **LLM**: gera spec Cypress a partir do contexto (requer OPENAI_API_KEY). |
| `write_test` | Grava spec em tests/cypress/e2e/{suite}/{nome}.cy.js. |
| `read_pr` | Lê diff ou URL de PR; retorna resumo/arquivos alterados. |
| `analyze_failures` | Recebe output do Cypress e extrai falhas estruturadas (spec, seletor, causa). |
| **`suggest_fix`** | **Nova**: recebe análise de falhas e retorna sugestões de correção (heurísticas para btn-edit-X, btn-delete-X, etc.). |
| `create_bug_report` | Gera relatório de bug a partir da análise. |

Fluxo **AI QA Engineer**: run_tests → (se falhou) analyze_failures → suggest_fix → saída com análise + correções sugeridas.

## Limpeza de usuários de teste

O banco pode acumular usuários (@teste.com). Para limpar antes dos testes:

```bash
npm run tests:clean-users     # na raiz
# ou via tool: node qa-agent.js clean_test_users
```

O **Failure Analyzer** (`agent:analyze-failures`) já executa a limpeza automaticamente antes de rodar os testes.

## Pré-requisitos

- Node.js 18+
- Na raiz do projeto: pasta `tests/` com Cypress configurado (`npm test` = `cypress run`).

## Instalação

Na pasta **`agents/`**:

```bash
cd agents
npm install
```

(O `mcp-server` tem suas próprias dependências em `mcp-server/node_modules`; o agente usa as de `agents/node_modules`.)

## Como rodar a prova (MCP + Agent)

### 1. Listar ferramentas (prova de conexão)

O agente conecta ao MCP server e lista as tools disponíveis:

```bash
cd agents
npm run agent
```

Ou diretamente:

```bash
node qa-agent.js
```

Saída esperada: algo como `[agent] Conectado ao MCP server qa-lab-mcp` e a lista com `run_tests`.

### 2. Executar os testes via agente (menu interativo)

Ao rodar o comando abaixo, o agente abre um **menu interativo** com todas as opções de teste:

```bash
cd agents
npm run agent:run-tests
```

Ou:

```bash
node qa-agent.js run_tests
```

No menu você pode:
- **1–5:** Rodar uma suíte (Todos, Admin, Auth, API, UI).
- **6:** Escolher um arquivo de teste específico (lista todos os `.cy.js`); em seguida digite o número do arquivo.
- **0:** Sair.

O exit code do processo reflete o resultado dos testes (0 = sucesso, 1 = falha).

### 3. Test Writer Agent – Ler, gerar, criar, rodar e verificar

Fluxo completo com LLM: o agente lê o projeto, gera um teste via OpenAI, grava o arquivo, roda e verifica se passou.

**Pré-requisito:** defina `OPENAI_API_KEY` ou `QA_LAB_LLM_API_KEY`.

```bash
# Suba backend e frontend antes (banco, API, app)
npm run db:up && npm run backend:dev & npm run frontend:dev

# Na raiz:
npm run agent:test-writer "healthcheck da API"
npm run agent:test-writer -- --suite auth --request "teste de login"
```

### 4. AI QA Engineer – Identificar falhas e sugerir correções

O **Failure Analyzer Agent** roda os testes e, se falharem, analisa o output e sugere correções:

```bash
cd agents
npm run agent:analyze-failures           # roda todos os testes
npm run agent:analyze-failures admin    # roda só a suíte admin
node failure-analyzer-agent.js cypress/e2e/admin/admin-dashboard-editar-idade-id2.cy.js  # spec específico
```

Saída: análise estruturada (spec, mensagem, causa) + sugestões de patch (ex.: trocar `btn-edit-2` por seleção por posição).

### 5. Apenas o servidor MCP (uso por outro cliente)

Se quiser apenas subir o servidor (por exemplo, para usar com o Cursor ou outro cliente MCP):

```bash
cd agents/mcp-server
npm install
npm start
```

O servidor fica escutando via stdio; um cliente MCP (Cursor, outro script) pode se conectar e chamar `run_tests`.

## Fluxo da prova

1. Você roda `npm run agent:run-tests` (ou `node qa-agent.js run_tests`).
2. O agente inicia o MCP server e mostra o **menu interativo** com todas as opções de teste (suítes e arquivos).
3. Você escolhe pelo número (ex.: 2 = Admin, 6 = depois escolher um arquivo).
4. O agente chama a tool `run_tests` com a suíte ou o spec escolhido.
5. O servidor executa o Cypress (todos os testes, uma suíte ou um arquivo) e devolve status e exit code.
6. O agente imprime o resultado e encerra com o mesmo exit code.
