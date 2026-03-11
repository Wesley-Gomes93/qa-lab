# TICTAC performance test

This document explains **what TICTAC is**, **why have a performance test like this**, and **what benefits** it brings to the project.

---

## What is TICTAC?

**TICTAC** stands for **T**ime-based **I**nteraction & **C**ritical path **T**esting for **A**pplication **C**ompliance.

It is a performance test focused on the user's **critical path**: instead of just measuring "is the app up?", it measures **how long** each important step takes until the user can use the system.

In QA Lab, TICTAC checks:

| Metric | What it measures | Default limit |
|--------|------------------|---------------|
| **Page load** | Time from fetch to `load` event (Playground) | 8 s |
| **API healthcheck** | Response time of `GET /health` | 2 s |
| **Form visible** | Time until login form is visible (Time to Interactive) | 5 s |
| **Dashboard after login** | Time from Login click to "Welcome back" on dashboard | 6 s |

Limits can be adjusted via environment variables in Cypress (e.g. `CYPRESS_TICTAC_LOAD_MS`, `CYPRESS_TICTAC_HEALTH_MS`, etc.).

---

## Why have a performance test like this?

### 1. **Functionality is not enough**

E2E and API tests ensure the flow *works*: registration, login, editing, etc. They do not ensure the flow is **fast**. A screen that takes 15 seconds to load can pass all functional tests and still be unacceptable to the user.

### 2. **Performance regression**

Any change (new dependencies, more data on screen, frontend or backend refactors) can slow down the application. TICTAC acts as a **guardrail**: if someone ships code that exceeds one of the limits, the test fails and the problem surfaces before production.

### 3. **Explicit critical path**

The test forces the team to define "what is critical" for the user (load home, see form, enter dashboard). This becomes a reference for optimizations and for prioritizing where to invest in performance.

### 4. **Pipeline integration**

The same command that runs E2E tests can run TICTAC (`npm test` or the `performance` suite in the agent). Thus, performance becomes a routine part of QA, not something "extra" that someone remembers to run from time to time.

---

## Benefits

- **Early detection:** time degradation (load, API, interactivity) is detected in CI or on the dev machine, not in user complaints.
- **Objective metrics:** numbers in milliseconds, with configurable limits, instead of subjective "it's slow".
- **Focus on what matters:** only the critical path (home → login → dashboard), without scattering across dozens of metrics at first.
- **Living documentation:** the spec itself and this doc explain what is "good" in terms of time for QA Lab.
- **Base for evolution:** more metrics can be added later (LCP, TTI via Lighthouse, etc.) keeping the same TICTAC concept.

---

## How to run

- **All tests (including TICTAC):** in `tests/` folder, `npm test`.
- **TICTAC only:**  
  `npx cypress run --spec "cypress/e2e/performance/tictac.cy.js"`
- **Via agent:** `npm run agent:run-tests` → **Performance – TICTAC (critical path)** option.

To relax or tighten limits (e.g. on slower CI):

```bash
CYPRESS_TICTAC_LOAD_MS=12000 CYPRESS_TICTAC_DASHBOARD_MS=8000 npx cypress run --spec "cypress/e2e/performance/tictac.cy.js"
```

---

## Summary

**TICTAC** is a performance test that measures the **time** of the critical steps in QA Lab (page load, API health, form visible, dashboard after login). Having such a test **prevents performance regressions** and keeps the application within acceptable limits, with **benefits** of early detection, objective metrics, and integration into the normal test flow.
