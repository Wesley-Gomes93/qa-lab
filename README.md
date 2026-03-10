# QA Lab 🧪

## Problem

QA automation is hard to scale: manual tests, scattered tools, and no clear pipeline to catch bugs before merge.

## Solution

A full-stack testing lab where automation, AI agents, and CI/CD work together. Every PR triggers a pipeline that runs lint, builds, tests (Cypress + Playwright), and generates reports. If anything fails, the merge is blocked.

## Result

- **Automated pipeline:** Lint → Build → Tests → Report (GitHub Actions)
- **Fast feedback:** Fail early on lint; parallel E2E runners (Cypress + Playwright)
- **Reports:** Mochawesome, Playwright, and a unified HTML report
- **Performance guardrails:** TICTAC tests for critical path latency (load, health, TTI, dashboard)
- **AI-assisted QA:** Agents for failure analysis, test execution, and **LLM-powered test generation** (Groq, Gemini, OpenAI)

---

## Quick Start

```bash
# 1. Instalar dependências
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
cd tests && npm install && cd ..

# 2. Subir ambiente (banco, backend, frontend) – verifica o que já está rodando
npm run dev

# 3. Rodar testes
npm run tests:run
```

## Comandos Principais

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Sobe banco, backend e frontend (dinâmico: só o que não estiver rodando) |
| `npm run tests:run` | Cypress E2E |
| `npm run tests:pw` | Playwright E2E |
| `npm run agent:run-tests` | Menu interativo para rodar testes via MCP |
| `npm run agent:test-writer "descrição"` | **Gerar testes com LLM** |
| `npm run agent:analyze-failures` | Analisa falhas e sugere correções |
| `npm run lint:check` | Verifica erros de lint |

## Todos os Comandos

| Comando | Descrição |
|---------|-----------|
| `npm run db:up` | Sobe PostgreSQL (Docker) |
| `npm run db:down` | Para o PostgreSQL |
| `npm run backend:install` | Instala deps do backend |
| `npm run backend:dev` | Sobe o backend (porta 4000) |
| `npm run frontend:install` | Instala deps do frontend |
| `npm run frontend:dev` | Sobe o frontend (porta 3000) |
| `npm run tests:install` | Instala deps dos testes |
| `npm run tests:run` | Cypress (npm test) |
| `npm run tests:pw` | Playwright E2E |
| `npm run tests:pw:ui` | Playwright em modo UI |
| `npm run tests:pw:report` | Playwright com relatório HTML |
| `npm run tests:report:unified` | Relatório unificado Cypress + Playwright |
| `npm run tests:contract` | Contract testing (OpenAPI spec) |
| `npm run tests:report` | Cypress com relatório Mochawesome |
| `npm run tests:clean-users` | Remove usuários @teste.com do banco |
| `npm run tests:full` | Limpa usuários + roda testes com relatório |
| `npm run agents:install` | Instala deps dos agents |
| `npm run agent` | Conecta ao MCP (menu/lista tools) |
| `npm run agent:run-tests` | Menu interativo para rodar Cypress |
| `npm run agent:analyze-failures` | Roda testes e analisa falhas |
| `npm run agent:analyze-failures admin` | Analisa falha só da suíte admin |
| `npm run agent:full` | Limpa usuários + roda testes via agent |
| `npm run agent:test-writer` | Ver combinações abaixo |
| `npm run dev` | Sobe ambiente completo (banco + backend + frontend) |
| `npm run lint:check` | Conta erros e warnings do ESLint |

---

## Test Writer Agent – Todas as combinações

Gera testes Cypress com LLM (Groq, Gemini ou OpenAI). **API key obrigatória** no `.env`.

**Suítes disponíveis:** `api` | `auth` | `admin` | `ui` | `performance`

### Forma 1 – Descrição direta (entre aspas)

```bash
npm run agent:test-writer "healthcheck da API"
npm run agent:test-writer "teste para POST /auth/register"
npm run agent:test-writer "GET /users retorna 403 sem token"
npm run agent:test-writer "teste de login com credenciais inválidas"
npm run agent:test-writer "validação de idade 18-80 no dashboard admin"
```

### Forma 2 – Com `--suite` e `--request` (use `--` antes dos args)

```bash
npm run agent:test-writer -- --suite api --request "healthcheck"
npm run agent:test-writer -- --suite api --request "POST /auth/register retorna 201"
npm run agent:test-writer -- --suite auth --request "login admin e redireciona"
npm run agent:test-writer -- --suite auth --request "logout limpa sessão"
npm run agent:test-writer -- --suite admin --request "editar idade do usuário"
npm run agent:test-writer -- --suite admin --request "filtro por usuário inativo"
npm run agent:test-writer -- --suite ui --request "elementos da tela inicial"
npm run agent:test-writer -- --suite performance --request "tempo de load da página"
```

### Forma 3 – Apenas descrição curta (suíte padrão: api)

```bash
npm run agent:test-writer "healthcheck"
npm run agent:test-writer "registro"
npm run agent:test-writer "login"
```

### Exemplos por suíte

| Suíte | Exemplo de request |
|-------|---------------------|
| **api** | `"GET /health"`, `"POST /auth/register"`, `"GET /users com token"` |
| **auth** | `"login admin"`, `"logout"`, `"registro completo"` |
| **admin** | `"editar idade"`, `"filtro inativo"`, `"excluir usuário"` |
| **ui** | `"formulário de registro visível"`, `"tabela de usuários"` |
| **performance** | `"load da página"`, `"healthcheck em menos de 2s"` |

→ **[Guia completo](./docs/AGENT-TEST-WRITER.md)**

---

## Documentation

- **[Test Strategy](./docs/test-strategy.md)** – Pyramid, coverage, risks, and when to run what
- **[API](./docs/API.md)** – Endpoints, authentication, request/response format
- **[Contract Testing](./docs/CONTRACT-TESTING.md)** – OpenAPI spec and schema validation
- **[Pipeline & Maintenance](./docs/PIPELINE.md)** – How to maintain the CI/CD pipeline, debug errors, and fix them
- **[Reports](./docs/RELATORIOS.md)** – Cypress, Playwright, and unified reports
- **[Test Writer Agent](./docs/AGENT-TEST-WRITER.md)** – LLM-based test generation (Groq, Gemini, OpenAI)
- **[SDET & Evolution](./docs/SDET-EVOLUCAO.md)** – SDET mindset, metrics, and tips for posts
- **[About the project](./docs/SOBRE-O-PROJETO.md)** – How the project started, current state, and next steps

## Architecture

- **Frontend:** Next.js
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Docker)
- **Automation:** Cypress / Playwright
- **AI Agents:** MCP + Test Writer (LLM), Failure Analyzer
- **CI/CD:** GitHub Actions

## Project Structure

```
qa-lab/
├── .github/         → CI/CD pipelines
├── agents/          → AI agents (MCP, Test Writer, Failure Analyzer)
├── backend/         → API services
├── database/        → Docker database setup
├── frontend/        → Next.js frontend
├── tests/           → Cypress + Playwright
└── docs/            → Documentation
```
