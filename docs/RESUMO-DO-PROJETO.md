# QA Lab Summary – What the project has

Quick, up-to-date reference of what exists in the project.

---

## Overview

**QA Lab** is a full-stack lab for training test automation, CI/CD, and AI agents. Each push triggers a full pipeline (lint → build → Cypress + Playwright → reports).

---

## Architecture

| Layer | Technology | Description |
|-------|-------------|-------------|
| Frontend | Next.js | Playground (register/login) + Admin dashboard (user CRUD) |
| Backend | Node.js + Express | REST API: auth, users, healthcheck |
| Database | PostgreSQL | Docker; users table; seed with admin |
| Tests | Cypress + Playwright | E2E in parallel; centralized specs for API |
| CI/CD | GitHub Actions | Pipeline: lint, build, tests, e2e, report |
| Agents | MCP, Node.js | Interactive menu, Test Writer (LLM), Failure Analyzer |

---

## API (backend)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Healthcheck + metrics |
| `/auth/register` | POST | No | Register user (201/409) |
| `/auth/login` | POST | No | Login (200/401) |
| `/users` | GET | Admin | List users |
| `/users/:id` | GET | Admin | Get by ID |
| `/users/:id` | PUT | Admin | Update (age, active) |
| `/users/:id` | DELETE | Admin | Delete (admin protected) |
| `/api/clean-test-users` | POST | Admin | Clean @teste.com users |

- **Auth:** `Authorization: Bearer <ADMIN_TOKEN>`
- **Contract:** `docs/api-spec.yaml` (OpenAPI 3.0)
- **Contract testing:** `npm run tests:contract`

---

## Tests

### Suites

| Suite | Cypress | Playwright | Focus |
|-------|---------|------------|-------|
| **api** | ✓ | ✓ | Health, register, users, clean |
| **auth** | ✓ | ✓ | Login, logout, registration |
| **admin** | ✓ | ✓ | Dashboard: edit, validation, filter, delete |
| **dashboard** | ✓ | ✓ | Health, Metrics, History, navigation |
| **ui** | ✓ | ✓ | UI elements |
| **performance** | ✓ | ✓ | TICTAC (load, health, form, dashboard) |

### Centralized specs (no duplication)

- `tests/shared/specs/api/` – health, clean-test-users
- Runners: `api-shared.cy.js` (Cypress) and `api-shared.spec.js` (Playwright)

### Complex flows (duplicated per framework)

- api-delete-user, api-users-creation, auth, admin, ui, performance

### Reports

- Mochawesome (Cypress)
- Playwright HTML report
- Unified report: `npm run tests:report:unified`

---

## Agents

| Agent | Command | What it does |
|-------|---------|--------------|
| **MCP Menu** | `npm run agent:run-tests` | Interactive menu to run Cypress by suite/file |
| **Test Writer** | `npm run agent:test-writer "description"` | Read project → generate test (LLM) → create → run → verify |
| **Failure Analyzer** | `npm run agent:analyze-failures` | Run tests; on failure, analyze and suggest fixes |

**Test Writer:** uses Groq, Gemini, or OpenAI (configure in `.env`).

---

## CI/CD Pipeline (GitHub Actions)

```
lint (24s) → build (23s) → [tests (Cypress) || e2e (Playwright)] → report
```

- **lint:** ESLint on frontend
- **build:** Next.js build
- **tests + e2e:** run in parallel (~3min each)
- **report:** generates `qa-lab-report` (artifact)
- **Extra workflow:** `agent.yml` – Failure Analyzer (manual)

---

## Main scripts

| Category | Commands |
|----------|----------|
| **Environment** | `npm run dev` (starts everything dynamically) |
| **Tests** | `tests:run` (Cypress), `tests:pw` (Playwright), `tests:report:unified` |
| **Agents** | `agent:run-tests`, `agent:test-writer`, `agent:analyze-failures` |
| **Database** | `db:up`, `db:down` |
| **Backend/Frontend** | `backend:dev`, `frontend:dev` |

---

## Documentation

| Document | Content |
|----------|---------|
| `README.md` | Quick start, commands, Test Writer |
| `docs/API.md` | Endpoints, auth, examples |
| `docs/PIPELINE.md` | CI/CD maintenance |
| `docs/TESTES-CYPRESS-VS-PLAYWRIGHT.md` | Strategy, centralized specs |
| `docs/COMO-ESCREVER-TESTES-CYPRESS-PLAYWRIGHT.md` | Login fail example, equivalences |
| `docs/AGENT-TEST-WRITER.md` | LLM, Groq/Gemini/OpenAI |
| `docs/RELATORIOS.md` | Cypress, Playwright, unified |
| `docs/CONTRACT-TESTING.md` | OpenAPI, schema validation |
| `docs/README.md` | Full documentation index |

---

## Portfolio

- **Portfolio:** `portfolio/` (Vercel)

---

## Folder structure

```
qa-lab/
├── .github/workflows/   # pipeline.yml, agent.yml
├── agents/              # MCP server, qa-agent, test-writer-agent, failure-analyzer
├── backend/             # Express API
├── database/            # docker-compose (PostgreSQL)
├── frontend/            # Next.js
├── tests/
│   ├── shared/          # constants, factories, specs/api
│   ├── cypress/         # e2e, pages, support
│   ├── playwright/      # e2e, support
│   └── contract/        # validate-against-spec
├── docs/                # documentation
├── portfolio/           # personal site
└── scripts/             # start-dev, lint-check
```

---

## In one sentence

**QA Lab** is a full-stack app (Next.js, Express, PostgreSQL) with a documented API, admin dashboard, E2E tests in Cypress and Playwright (with centralized specs for the API), CI/CD pipeline on GitHub Actions, and MCP agents (menu, Test Writer with LLM, Failure Analyzer) for automation and failure analysis.
