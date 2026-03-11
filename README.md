# QA Lab 🧪

[![Pipeline](https://img.shields.io/github/actions/workflow/status/Wesley-Gomes93/qa-lab/pipeline.yml?branch=main&label=build)](https://github.com/Wesley-Gomes93/qa-lab/actions)
[![Node](https://img.shields.io/badge/node-20.x-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Full-stack QA lab with dual E2E (Cypress + Playwright), contract testing, performance suite, and LLM-powered test generation.**

---

## Problem → Solution → Result

**Problem:** QA automation is hard to scale — manual tests, scattered tools, and no clear pipeline to catch bugs before merge.

**Solution:** A full-stack testing lab where automation, AI agents, and CI/CD work together. Every PR triggers a pipeline; every failure blocks the merge.

**Result:** Automated quality gates, fast feedback (~5 min), unified reports, and AI-assisted test generation. The merge only goes through when everything passes.

---

## Links

| Link | URL |
|------|-----|
| **Repository** | [github.com/Wesley-Gomes93/qa-lab](https://github.com/Wesley-Gomes93/qa-lab) |
| **Pipeline** | [Actions → pipeline](https://github.com/Wesley-Gomes93/qa-lab/actions) |
| **Demo** | _Add your Vercel/deploy URL when available_ |

---

## What I Learned

- **Dual E2E stack** — Running Cypress and Playwright in parallel taught me to design tests that can run on both; centralized specs for API tests reduced duplication.
- **Contract testing** — OpenAPI schema validation catches breaking changes before they reach E2E; a small investment with high ROI.
- **MCP and agents** — Integrating LLM-powered test generation (Groq, Gemini, OpenAI) showed how AI can extend QA workflows without replacing critical thinking.
- **Pipeline design** — Lint → Build → Tests (parallel) → Report creates fast feedback; blocking merge on failure enforces quality at the gate.
- **Performance as a test** — TICTAC metrics (load, health, TTI) turned performance from "nice to have" into an assertable requirement.

---

## Architecture decisions

**Why Cypress + Playwright?** Both frameworks run the same scenarios. I kept both to compare APIs, reports, and maintenance overhead. Playwright tends to run ~3x faster in CI; Cypress has a larger ecosystem. The decision was data-driven, not tool-centric.

**Why AI agents?** The Test Writer and Failure Analyzer extend QA without replacing critical thinking. They show how LLM integration fits into real workflows — generating specs from descriptions and suggesting fixes when tests fail.

**Why contract testing?** OpenAPI validation catches breaking API changes before E2E. A small upfront investment (schema + validator script) prevents subtle bugs from reaching UI tests.

**Trade-offs:** I chose not to add full AWS infra (ECS, ALB, CDN) — the ROI for a QA portfolio is low compared to polish and documentation. I also deferred Slack/Teams notifications and historical dashboards; they add value in production, less so for portfolio presentation.

---

## Tech Highlights

| Area | What's in place |
|------|-----------------|
| **CI/CD Pipeline** | Lint → Build → Tests (Cypress \|\| Playwright) → Unified Report. Merge blocked if any step fails. |
| **Dual E2E Stack** | Cypress + Playwright run in parallel. Centralized specs for API tests (one source, two runners). |
| **Contract Testing** | OpenAPI 3.0 spec validation. Schema checks before deploy. |
| **Performance Testing** | TICTAC suite: load, health, TTI, dashboard critical path latency. |
| **AI Agents** | 3 agents: MCP menu (interactive test runs), Test Writer (LLM-powered — Groq, Gemini, OpenAI), Failure Analyzer (auto-diagnose and suggest fixes). |
| **Reports** | Mochawesome (Cypress), Playwright HTML, unified QA Lab report. |

---

## Pipeline Flow

```
PR opened / push to main
        ↓
   Lint (ESLint)
        ↓
   Build (Next.js)
        ↓
   ┌────────────┬────────────┐
   │  Cypress   │  Playwright │  ← run in parallel
   │   E2E      │     E2E     │
   └────────────┴────────────┘
        ↓
   Unified Report
        ↓
   ci ✅ (merge allowed)  or  ci ❌ (merge blocked)
```

---

## Screenshots

| Pipeline | Unified Report |
|----------|----------------|
| ![Pipeline](https://via.placeholder.com/400x200?text=Pipeline+%E2%9C%85) | ![Report](https://via.placeholder.com/400x200?text=Unified+Report) |

_Replace with real captures: add `pipeline.png` and `report-unified.png` to `docs/screenshots/` and update the paths above._ → [Capture instructions](./docs/screenshots/README.md)

---

## Architecture

| Layer | Tech | Description |
|-------|------|-------------|
| Frontend | Next.js | Playground (auth) + Admin dashboard (CRUD users) |
| Backend | Node.js + Express | REST API: auth, users, healthcheck |
| Database | PostgreSQL | Docker; seed with admin user |
| Tests | Cypress + Playwright | E2E suites: api, auth, admin, ui, performance |
| CI/CD | GitHub Actions | pipeline.yml, agent.yml |
| Agents | MCP, Node.js | Menu, Test Writer (LLM), Failure Analyzer |

---

## Quick Start

```bash
# 1. Install dependencies
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
cd tests && npm install && cd ..

# 2. Start environment (DB, backend, frontend)
npm run dev

# 3. Run tests
npm run tests:run
```

---

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start DB, backend, frontend (dynamic: only starts what's not running) |
| `npm run tests:run` | Cypress E2E |
| `npm run tests:pw` | Playwright E2E |
| `npm run tests:report:unified` | Unified HTML report (Cypress + Playwright) |
| `npm run tests:contract` | Contract testing against OpenAPI spec |
| `npm run agent:run-tests` | Interactive menu to run Cypress via MCP |
| `npm run agent:test-writer "description"` | **Generate tests with LLM** (Groq, Gemini, OpenAI) |
| `npm run agent:analyze-failures` | Run tests; on failure, analyze and suggest fixes |

---

## Test Writer Agent

Generate Cypress and/or Playwright tests from natural language. **API key required** in `.env` (Groq or Gemini are free).

```bash
npm run agent:test-writer "API healthcheck"
npm run agent:test-writer "POST /auth/register returns 201"
npm run agent:test-writer -- --framework both "login flow"  # Cypress + Playwright
```

**Suites:** `api` | `auth` | `admin` | `dashboard` | `ui` | `performance`  
→ **[Full guide](./docs/AGENT-TEST-WRITER.md)** — all combinations, env vars, examples per suite.

---

## Documentation

| Doc | Content |
|-----|---------|
| [Test Strategy](./docs/test-strategy.md) | Pyramid, coverage, risks, when to run what |
| [Cypress vs Playwright](./docs/TESTES-CYPRESS-VS-PLAYWRIGHT.md) | Strategy, when to share specs vs duplicate |
| [API](./docs/API.md) | Endpoints, auth, request/response format |
| [Contract Testing](./docs/CONTRACT-TESTING.md) | OpenAPI spec and schema validation |
| [Pipeline & Maintenance](./docs/PIPELINE.md) | CI/CD maintenance, debug, branch protection |
| [Reports](./docs/RELATORIOS.md) | Cypress, Playwright, unified reports |
| [Test Writer Agent](./docs/AGENT-TEST-WRITER.md) | LLM-based test generation (Groq, Gemini, OpenAI) |
| [Project Summary](./docs/RESUMO-DO-PROJETO.md) | Full reference — architecture, API, suites, agents |
| [About the project](./docs/SOBRE-O-PROJETO.md) | Origin, current state, roadmap |

---

## Project Structure

```
qa-lab/
├── .github/workflows/   # pipeline.yml, agent.yml
├── agents/              # MCP server, qa-agent, test-writer-agent, failure-analyzer
├── backend/             # Express API
├── database/            # Docker (PostgreSQL)
├── frontend/            # Next.js
├── tests/
│   ├── shared/          # constants, factories, centralized specs/api
│   ├── cypress/         # e2e, support
│   ├── playwright/      # e2e, support
│   └── contract/        # validate-against-spec
├── docs/                # documentation
└── scripts/             # start-dev, lint-check
```

---

## All Commands

| Command | Description |
|---------|-------------|
| `npm run db:up` | Start PostgreSQL (Docker) |
| `npm run db:down` | Stop PostgreSQL |
| `npm run backend:install` | Install backend deps |
| `npm run backend:dev` | Start backend (port 4000) |
| `npm run frontend:install` | Install frontend deps |
| `npm run frontend:dev` | Start frontend (port 3000) |
| `npm run tests:install` | Install test deps |
| `npm run tests:run` | Cypress E2E |
| `npm run tests:pw` | Playwright E2E |
| `npm run tests:pw:ui` | Playwright UI mode |
| `npm run tests:pw:report` | Playwright HTML report |
| `npm run tests:report:unified` | Unified Cypress + Playwright report |
| `npm run tests:contract` | Contract testing (OpenAPI spec) |
| `npm run tests:report` | Cypress with Mochawesome |
| `npm run tests:clean-users` | Remove @teste.com users from DB |
| `npm run tests:full` | Clean users + run tests with report |
| `npm run agents:install` | Install agent deps |
| `npm run agent` | Connect to MCP (list tools) |
| `npm run agent:run-tests` | Interactive menu to run Cypress |
| `npm run agent:analyze-failures` | Run tests and analyze failures |
| `npm run agent:analyze-failures admin` | Analyze failures for admin suite only |
| `npm run agent:full` | Clean users + run tests via agent |
| `npm run agent:test-writer` | Test Writer (see guide above) |
| `npm run dev` | Full environment (DB + backend + frontend) |
| `npm run lint:check` | ESLint errors and warnings |
