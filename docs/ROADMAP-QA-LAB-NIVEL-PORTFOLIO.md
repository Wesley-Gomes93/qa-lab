# Roadmap – QA Lab at portfolio level

This document describes the **target architecture** and **implementation phases** to bring QA Lab to the desired level: test history dashboard, visual reports (Cypress + mochawesome), observability (logs, metrics, health), and agents at the AI QA Engineer level.

---

## Target architecture

```
qa-lab/
├── frontend (Next.js)
│   └── Dashboard: users (existing) + test history + reports + metrics + health
├── backend (Node API)
│   └── Observability: structured logs, metrics, detailed health
├── database (PostgreSQL Docker)
│   └── Tables: users (existing), test_runs, metrics_snapshots, api_logs (optional)
├── tests (Cypress)
│   └── Reporter: mochawesome → JSON/HTML + send results to API
├── agents/
│   ├── QA Agent           → run tests, interactive menu (existing)
│   ├── Test Generator Agent → read PR/code, generate tests
│   └── Failure Analyzer Agent → analyze failures, create bug report
├── mcp-server
│   └── Tools: run_tests, get_users_summary, read_pr, generate_tests, analyze_failures, create_bug_report
└── .github/
    └── CI/CD: workflow that runs tests and sends results to backend
```

---

## Implementation phases

### Phase 1 – Backend observability
- **Structured logs:** middleware that logs in JSON (timestamp, method, path, status, duration, requestId).
- **In-memory metrics (or DB):**
  - API response time (per route or global).
  - Auth success rate (login success / total attempts).
  - Test failure rate (last N runs: failed / total).
- **Detailed health check:** `GET /health` returns API status, DB status, and if available, metrics summary (e.g. last_test_run, auth_success_rate).

### Phase 2 – Test history and metrics persistence
- **Tables:**
  - `test_runs`: id, suite/spec, status (passed/failed), duration_ms, total_tests, passed, failed, reported_at, source (ci|agent|manual), metadata (JSON, e.g. mochawesome summary).
  - `metrics_snapshots` (optional): timestamp, api_avg_ms, auth_success_rate, test_failure_rate, etc.
- **Endpoints:**
  - `POST /api/test-runs` (admin or API key): receives payload from Cypress/mochawesome or CI and writes to `test_runs`.
  - `GET /api/test-runs`: lists history (pagination, filters).
  - `GET /api/metrics` or data embedded in `/health`: current metrics for the dashboard.

### Phase 3 – Cypress + mochawesome and result submission
- **Cypress:** configure `mochawesome` reporter (or `cypress-mochawesome-reporter`) to generate JSON + HTML.
- **Post-test script:** after `cypress run`, read the mochawesome JSON and send to `POST /api/test-runs` (local or CI).
- **CI:** workflow that runs tests, generates report, and calls the API to register the run.

### Phase 4 – Next.js Dashboard (history, reports, metrics, health)
- **Dashboard pages/tabs (or routes):**
  - Test history: table/cards of `test_runs` (date, suite, status, duration, passed/failed), link to HTML report if available.
  - Visual reports: list of runs with link to mochawesome report (hosted HTML or CI artifact).
  - Metrics: cards or charts for API Response Time, Auth Success Rate, Test Failure Rate (from `GET /api/metrics` or `/health`).
  - Health: display payload of `GET /health` (API, DB, optionally dependencies).
- **Navigation:** menu or tabs in existing dashboard (Admin → Users | Tests | Metrics | Health).

### Phase 5 – MCP and agents (AI QA Engineer)
- **New MCP tools:**
  - `read_pr`: receives diff or PR URL and returns context (changed files, summary) for the agent.
  - `generate_tests`: receives context (code or PR) and calls logic/LLM to suggest or generate Cypress specs (may integrate with Test Generator Agent).
  - `analyze_failures`: receives output of failed tests (log or JSON) and returns structured analysis (may integrate with Failure Analyzer Agent).
  - `create_bug_report`: generates bug report text/structure from failure analysis.
- **Test Generator Agent:** uses `read_pr` + `generate_tests` (and optionally LLM) to propose new tests.
- **Failure Analyzer Agent:** uses `run_tests` + `analyze_failures` + `suggest_fix` to identify failures and **suggest fixes** automatically (besides bug report).

### Phase 6 – CI/CD
- **GitHub Actions workflow:**
  - Trigger: push/PR to main branch (or tags).
  - Jobs: start DB (or use service), start backend, start frontend (or backend only for API tests), run Cypress.
  - Post-test: send results to `POST /api/test-runs` (backend must be accessible; alternatively, store artifacts and display in dashboard via manual upload or artifact link).
- **Documentation:** README or `docs/CI-CD.md` with instructions for running locally and in CI.

---

## Suggested execution order

1. **Phase 1** – Observability (logs, metrics, health).  
2. **Phase 2** – DB + test-runs and metrics endpoints.  
3. **Phase 3** – Cypress mochawesome + submission script.  
4. **Phase 4** – Dashboard (history, reports, metrics, health).  
5. **Phase 5** – MCP (new tools) + Test Generator and Failure Analyzer agents.  
6. **Phase 6** – CI/CD and documentation.

---

## Summary

| Item | What it is |
|------|------------|
| **History dashboard** | Next.js page that lists `test_runs` (date, suite, status, duration, passed/failed). |
| **Visual reports** | Cypress with mochawesome; links in dashboard to HTML reports or artifacts. |
| **Observability** | JSON logs, metrics (API response time, auth success rate, test failure rate), detailed health. |
| **AI QA Agents** | QA Agent (run tests), Test Generator (PR → generate tests), Failure Analyzer (failures → analysis + bug report). |
| **Final structure** | frontend, backend, database, tests, agents (QA, Test Generator, Failure Analyzer), mcp-server, .github. |

This roadmap serves as a guide for phased implementation; each phase can be delivered and reviewed before moving to the next.
