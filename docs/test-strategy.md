# Test Strategy – QA Lab

This document describes the testing approach for the QA Lab: pyramid, coverage, risks, and when each layer runs.

---

## Test Pyramid

```
                    ▲
                   / \
                  / E2E \         ← Cypress + Playwright (auth, admin, API, UI, performance)
                 /-------\
                /   API   \       ← Direct API tests (health, users CRUD, auth)
               /-----------\
              /  Integration \    ← Full stack via Cypress/Playwright API specs
             /---------------\
            /                 \
           /                   \
          /_____________________\
```

| Layer | Tools | Location | Purpose |
|-------|-------|----------|---------|
| **E2E** | Cypress, Playwright | `tests/cypress/e2e/`, `tests/playwright/e2e/` | Critical user flows: auth, admin dashboard, registration |
| **API** | Cypress, Playwright | `tests/.../api/` | API contracts, healthcheck, user CRUD |
| **Performance** | TICTAC (Cypress/Playwright) | `tests/.../performance/tictac` | Time-based critical path (load, health, TTI, dashboard) |
| **Integration** | E2E specs that hit API + UI | Admin flows, register-and-login | Validates frontend + backend together |

---

## Current Coverage

### Test Suites

| Suite | Specs | What it validates |
|-------|-------|-------------------|
| **auth** | register, login, logout | Registration, login, logout flows |
| **admin** | dashboard CRUD, filters, validation | User management, age validation (18–80), active/inactive |
| **api** | health, users, delete, cleanup | API endpoints, auth tokens, error handling |
| **ui** | elements visibility, interactions | UI components render correctly |
| **performance** | TICTAC | Load time, health latency, time to interactive |

### Coverage Gaps (Future Improvements)

- **Unit tests** – Frontend components and backend logic (Jest, Vitest)
- **Contract testing** – Pact or similar for API consumer/provider contracts
- **Load testing** – k6 or JMeter for concurrent user simulation
- **Resilience testing** – Fault injection, chaos-style scenarios

---

## Risks and Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Flaky E2E** | CI fails randomly | Isolated specs, retries on network/timeouts, stable selectors (test IDs) |
| **Slow pipeline** | Long feedback loop | Cypress and Playwright run in parallel; lint blocks early on failure |
| **API changes break tests** | False failures | API documentation (`docs/API.md`), versioned contracts, shared fixtures |
| **Environment drift** | Tests pass locally, fail in CI | Docker for DB, same Node version, documented env vars |
| **Performance regression** | Slow UX goes unnoticed | TICTAC limits (load, health, dashboard time) fail pipeline if exceeded |

---

## When to Run What

| Trigger | What runs |
|---------|-----------|
| **Every PR / push** | Lint → Build → Cypress + Playwright (parallel) → Report |
| **Before merge** | Same as above; branch protection blocks merge if any job fails |
| **Local dev** | `npm run tests:run` (Cypress) or `npm run tests:pw` (Playwright) |
| **Manual – performance only** | `npx cypress run --spec "cypress/e2e/performance/tictac.cy.js"` |
| **Agent analysis** | Failure Analyzer Agent (manual workflow) – runs tests and analyzes failures |

---

## Metrics and Reporting

- **Cypress:** Mochawesome HTML report → `tests/cypress/reports/`
- **Playwright:** HTML report → `tests/playwright-report/`
- **Unified:** `npm run tests:report:unified` → `tests/qa-lab-reports/index.html`
- **CI artifacts:** `cypress-report`, `playwright-report`, `qa-lab-report` (download from GitHub Actions)

---

## Summary

The QA Lab test strategy follows a pyramid: E2E and API tests cover critical flows; TICTAC adds performance guards. Risks are addressed with stable environments, documentation, and CI that blocks merge on failure.
