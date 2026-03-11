# About the project – QA Lab

This document tells where QA Lab came from, where it is today, and where we want to take it.

---

## Origin: the need to learn

The project was born from two clear motivations:

1. **Learn more about advanced JavaScript**  
   Not just "make it work", but use closures, composition, async, data structures, and patterns that appear in real code and modern tools.

2. **Learn MCP and agents (MCP + Agent)**  
   Understand in practice what the Model Context Protocol (MCP) is, how to integrate AI agents into development and testing flows, and how this fits into a QA project.

QA Lab is the **practice ground** for both: a real project with API, frontend, database, and tests, where you can experiment with JavaScript and MCP/agents beyond theory.

---

## What QA Lab is today

QA Lab is a **full-stack playground for tests and automation**: a complete application where you can train on automation (E2E, API), pipelines, and agents that interact with this same environment.

### Current stack

- **Frontend:** Next.js (Playground + admin dashboard)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Docker in `database/`)
- **Tests:** Cypress + Playwright (E2E in `auth/`, `api/`, `admin/`, `dashboard/`, `ui/`, `performance/`)
- **Agents:** `agents/` folder with MCP server and QA agent

### Where we are today

- **API:** registration, login, healthcheck, user CRUD with admin role; age validation (18–80); rule that admin cannot be deleted. Documentation in `docs/API.md`.
- **Frontend:** initial screen with registration and login; admin dashboard with user list, edit (name, email, age, active), delete (except admin), and search filter.
- **Tests:** specs organized by flow (one file per scenario in `admin/`, `dashboard/`, etc.), full dashboard suite, API tests, auth, and UI; use of helpers and page objects.
- **Agents:** MCP server in `agents/mcp-server/` and `qa-agent.js` as entry point; Test Writer (LLM), Failure Analyzer.

In short: we have a **functional end-to-end project**, documented (API + this text), with automated tests and the foundation for MCP/agents.

---

## Where we're going: next steps

The idea is to use QA Lab to **deepen advanced JavaScript** and **MCP + agents**, keeping the project as a living lab.

### Short term

- **Documentation:** maintain and expand (API in `docs/API.md`, this file in `docs/SOBRE-O-PROJETO.md`). Include local execution guide (backend, frontend, database, tests) and E2E reference.
- **MCP and agents:** evolve the MCP server and agents so they can, for example, list and run tests, read results, and suggest new cases based on code and API behavior.
- **CI/CD:** use pipelines in `.github/` to run tests (E2E and API) on every push/PR and, when it makes sense, expose reports or status for agents.

### Medium term

- **Advanced JavaScript:** apply more advanced patterns in backend and frontend (function composition, data pipelines, standardized error handling) and document choices in comments or a small "project patterns" doc.
- **Agents that "understand" QA Lab:** the agent not only runs tests but knows the project structure (API routes, dashboard flows, business rules) and can propose scenarios, analyze failures, and suggest fixes or new tests.
- **More test scenarios:** expand coverage (e.g. more API error flows, unauthorized access, dashboard edge cases) always with one spec per scenario for clarity.

### Long term

- **QA Lab as an experimentation platform:** anyone (or another agent) can clone the repo, start the environment, and train automation, MCP, and agents with a real use case.
- **Ongoing MCP integration:** the same project that serves to learn MCP and agents becomes used in real QA flows (test suggestions, result analysis, documentation generation from code and API).

---

## Summary

QA Lab **started** from the desire to learn advanced JavaScript and MCP/agents. **Today** it is a full-stack project with a documented API, frontend with admin dashboard, and an organized E2E suite, plus the foundation for MCP and agents. The **next steps** are to consolidate documentation and local execution, evolve the MCP server and QA agent, and use the project itself as a lab to deepen JavaScript and agent integration.
