# QA Lab 🧪

[![Pipeline](https://img.shields.io/github/actions/workflow/status/Wesley-Gomes93/qa-lab/pipeline.yml?branch=main&label=build)](https://github.com/Wesley-Gomes93/qa-lab/actions)
[![Node](https://img.shields.io/badge/node-20.x-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**QA portfolio.** A lab I built to practice and deepen my craft — E2E automation, API testing, contract validation, and CI/CD. What I learned along the way is documented here.

---

## Índice

- [Sobre o projeto](#sobre-o-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como rodar](#como-rodar)
- [Comandos principais](#comandos-principais)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Perguntas e respostas](#perguntas-e-respostas)
- [Documentação](#documentação)
- [Palavras-chave](#palavras-chave)

---

## Sobre o projeto

O **QA Lab** é um laboratório full-stack para automação de testes. Ele combina:

- **E2E duplo** — Cypress e Playwright rodando os mesmos cenários em paralelo
- **Contract testing** — Validação da API contra schema OpenAPI
- **Performance** — Suite TICTAC (load, health, TTI)
- **Agentes de IA** — Test Writer (gera testes com LLM) e Failure Analyzer (analisa falhas)
- **CI/CD** — Pipeline que bloqueia merge em caso de falha
- **Makefile** — Orquestrador local para lint, testes e relatórios

**Problema → Solução → Resultado**

| | |
|---|---|
| **Problema** | QA difícil de escalar: testes manuais, ferramentas dispersas, sem pipeline |
| **Solução** | Lab integrado: automação + agentes + CI/CD em um único fluxo |
| **Resultado** | Gates de qualidade, feedback ~5 min, merge só quando tudo passa |

---

## Pré-requisitos

- **Node.js 20.x** — [nodejs.org](https://nodejs.org/)
- **Docker** — Para PostgreSQL (ou use serviço externo)
- **Make** — Geralmente já instalado (macOS, Linux); no Windows use WSL ou [Chocolatey](https://chocolatey.org/packages/make)
- **Chave de API** (opcional) — Groq ou Gemini para o Test Writer (gratuitos)

---

## Instalação

### Opção 1: Com Make (recomendado)

```bash
# Clone o repositório
git clone https://github.com/Wesley-Gomes93/qa-lab.git
cd qa-lab

# Instale todas as dependências (raiz, frontend, backend, tests, agents, qa-extended)
make install
```

### Opção 2: Manual

```bash
git clone https://github.com/Wesley-Gomes93/qa-lab.git
cd qa-lab

# Raiz
npm install

# Subprojetos
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
cd tests && npm install && cd ..
cd agents && npm install && cd ..
cd qa-extended-lab && npm ci && cd ..
```

### QA Extended (acessibilidade)

Para rodar testes de acessibilidade (axe), instale o Chromium no Playwright:

```bash
cd qa-extended-lab && npx playwright install chromium && cd ..
```

---

## Como rodar

### 1. Subir o ambiente

```bash
make dev
```

Ou manualmente:

```bash
npm run db:up      # PostgreSQL (Docker)
npm run backend:dev &
npm run frontend:dev &
```

O script `npm run dev` sobe apenas o que ainda não está rodando (DB → backend → frontend).

### 2. Rodar testes

```bash
make qa            # QA completo (lint + contract + Cypress + Playwright + report)
```

Ou por parte:

```bash
make qa-lint       # Só lint
make qa-contract   # Contract testing
make qa-cy         # Cypress E2E
make qa-pw         # Playwright E2E
```

### 3. Simular o pipeline CI

```bash
make ci            # Lint + contract + E2E (sem relatório)
make ci-full       # Inclui QA Extended (Newman + axe)
```

---

## Comandos principais

### Make (orquestrador)

| Comando | Descrição |
|---------|-----------|
| `make help` | Lista todos os targets |
| `make install` | Instala todas as dependências |
| `make dev` | Sobe ambiente (DB + backend + frontend) |
| `make qa` | QA completo: lint + contract + E2E + report |
| `make ci` | Simula pipeline CI |
| `make qa-extended` | Newman + axe (API pública, acessibilidade) |
| `make lint` | Roda lint |
| `make clean` | Remove relatórios e artefatos |

### npm (comandos diretos)

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Sobe ambiente completo |
| `npm run tests:run` | Cypress E2E |
| `npm run tests:pw` | Playwright E2E |
| `npm run tests:contract` | Contract testing (OpenAPI) |
| `npm run tests:report:unified` | Relatório unificado |
| `npm run agent:run-tests` | Menu interativo (MCP) |
| `npm run agent:test-writer "descrição"` | Gera teste com LLM |
| `npm run agent:analyze-failures` | Analisa falhas de testes |
| `npm run lint:check` | Verifica erros ESLint |

→ Referência completa: [docs/COMANDOS.md](docs/COMANDOS.md)

---

## Estrutura do projeto

```
qa-lab/
├── Makefile             # Orquestrador (make help, make qa, make ci)
├── .github/workflows/   # pipeline.yml, agent.yml
├── agents/              # MCP, qa-agent, test-writer-agent, failure-analyzer
├── backend/             # Express API (auth, users, healthcheck)
├── database/            # Docker (PostgreSQL)
├── frontend/            # Next.js (auth + admin dashboard)
├── tests/
│   ├── shared/          # Specs centralizados, factories
│   ├── cypress/         # E2E Cypress
│   ├── playwright/      # E2E Playwright
│   └── contract/         # Validação contra OpenAPI
├── qa-extended-lab/     # Newman + axe (API pública, a11y)
├── docs/                # Documentação
└── scripts/             # start-dev, lint-check
```

### Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js |
| Backend | Node.js + Express |
| Banco | PostgreSQL (Docker) |
| Testes | Cypress + Playwright |
| CI/CD | GitHub Actions |
| Agentes | MCP, Node.js, LLM (Groq/Gemini/OpenAI) |

---

## Perguntas e respostas

### Como instalo tudo de uma vez?

Use `make install`. Ele instala dependências da raiz, frontend, backend, tests, agents e qa-extended-lab.

### Preciso rodar o backend antes dos testes?

Sim. Os testes E2E e de contrato precisam da API rodando. Use `make dev` para subir DB + backend + frontend.

### O Test Writer precisa de chave de API?

Sim. Configure `.env` no `agents/` com `GROQ_API_KEY` ou `GEMINI_API_KEY` (ambos têm tier gratuito).

### Como simulo o pipeline localmente?

Use `make ci` (lint + contract + E2E) ou `make ci-full` (inclui QA Extended).

### Onde ficam os relatórios?

- Cypress: `tests/cypress/reports/`
- Playwright: `tests/playwright-report/`
- Unificado: `tests/qa-lab-reports/` (após `npm run tests:report:unified` ou `make qa`)

### O Make roda no Windows?

Recomenda-se WSL. Ou instale Make via [Chocolatey](https://chocolatey.org/packages/make).

---

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [PRIMEIRO-DIA-NO-LAB.md](docs/PRIMEIRO-DIA-NO-LAB.md) | **Primeiro dia** — passo a passo do clone até rodar os primeiros testes |
| [AMBIENTE-TROUBLESHOOTING.md](docs/AMBIENTE-TROUBLESHOOTING.md) | Subir ambiente e resolver erros comuns |
| [MAKEFILE-GUIA.md](docs/MAKEFILE-GUIA.md) | Sintaxe do Make, targets, boas práticas |
| [COMANDOS.md](docs/COMANDOS.md) | Referência de todos os comandos |
| [api-spec.yaml](docs/api-spec.yaml) | Contrato OpenAPI da API |

---

## Links

| Link | URL |
|------|-----|
| **Repositório** | [github.com/Wesley-Gomes93/qa-lab](https://github.com/Wesley-Gomes93/qa-lab) |
| **Pipeline** | [Actions](https://github.com/Wesley-Gomes93/qa-lab/actions) |
| **QA Extended Lab** | [qa-extended-lab/](qa-extended-lab/) (Newman + axe) |

---

## Primeiros passos (First Day)

**Primeiro dia no lab?** Siga o passo a passo completo: [PRIMEIRO-DIA-NO-LAB.md](docs/PRIMEIRO-DIA-NO-LAB.md)

Resumo rápido:

| Ordem | Lab | O que fazer |
|-------|-----|-------------|
| 1 | **QA Lab (app)** | `make install` → `make dev` → `make qa` |
| 2 | **QA Extended** | Newman + axe (roda sem subir o app) |

**Problemas?** Veja [AMBIENTE-TROUBLESHOOTING.md](docs/AMBIENTE-TROUBLESHOOTING.md).

---

## Palavras-chave

`qa` `automation` `cypress` `playwright` `e2e` `contract-testing` `openapi` `ci-cd` `github-actions` `llm` `test-generation` `nodejs` `nextjs` `express` `postgresql` `makefile` `mcp` `ai-agents` `accessibility` `axe` `newman` `postman` `sdet`

---

## Licença

MIT — veja [LICENSE](LICENSE).
