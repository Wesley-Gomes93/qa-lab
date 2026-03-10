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
- **AI-assisted QA:** Agents for failure analysis and test execution

---

## Documentation

- **[Test Strategy](./docs/test-strategy.md)** – Pyramid, coverage, risks, and when to run what
- **[API](./docs/API.md)** – Endpoints, authentication, request/response format
- **[Contract Testing](./docs/CONTRACT-TESTING.md)** – OpenAPI spec and schema validation
- **[Pipeline & Maintenance](./docs/PIPELINE.md)** – How to maintain the CI/CD pipeline, debug errors, and fix them
- **[Reports](./docs/RELATORIOS.md)** – Cypress, Playwright, and unified reports
- **[SDET & Evolution](./docs/SDET-EVOLUCAO.md)** – SDET mindset, metrics, and tips for posts
- **[About the project](./docs/SOBRE-O-PROJETO.md)** – How the project started, current state, and next steps

## Architecture

- **Frontend:** Next.js
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Docker)
- **Automation:** Cypress / Playwright
- **AI Agents:** MCP Agents
- **CI/CD:** GitHub Actions

## Project Structure

```
qa-lab/
├── .github/         → CI/CD pipelines
├── agents/          → AI agents for QA
├── backend/         → API services
├── database/        → Docker database setup
├── frontend/        → Next.js frontend
└── tests/           → automated tests
```
