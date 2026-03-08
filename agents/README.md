# Agentes e MCP – QA Lab

Esta pasta contém o **servidor MCP** (Model Context Protocol) e o **agente de QA** que se conecta a ele para executar ações (por exemplo, rodar os testes Cypress).

## Estrutura

- **`mcp-server/`** – Servidor MCP que expõe ferramentas (tools). Hoje: `run_tests` (executa `npm test` na pasta `tests/` do projeto).
- **`qa-agent.js`** – Cliente/agente que conecta ao servidor via stdio, lista as ferramentas e pode invocar uma (ex.: `run_tests`).

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

### 3. Apenas o servidor MCP (uso por outro cliente)

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
