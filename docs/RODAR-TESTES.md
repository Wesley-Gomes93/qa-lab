# How to run tests – Cypress and Playwright

The same scenarios are implemented in both frameworks. Use the commands below.

---

## Main commands

| Command | What it does |
|---------|--------------|
| `npm run test:cy` | Runs Cypress + **summary** at the end |
| `npm run test:pw` | Runs Playwright + **summary** at the end |
| `npm run test:all` | Runs both + **unified summary** |

Always run from the **project root** or from inside `tests/`. The summary shows: passed, failed, skip, total, and duration.

---

## Equivalent suites

| Suite | Cypress | Playwright |
|-------|---------|------------|
| admin | `cypress/e2e/admin/*.cy.js` | `playwright/e2e/admin/` |
| api | `cypress/e2e/api/*.cy.js` | `playwright/e2e/api/` |
| auth | `cypress/e2e/auth/*.cy.js` | `playwright/e2e/auth/` |
| dashboard | `cypress/e2e/dashboard/*.cy.js` | `playwright/e2e/dashboard/` |
| ui | `cypress/e2e/ui/*.cy.js` | `playwright/e2e/ui/` |
| performance | `cypress/e2e/performance/*.cy.js` | `playwright/e2e/performance/` |

---

## Run a single suite

```bash
# Dashboard (from inside tests/):
npm run test:cy -- --spec "cypress/e2e/dashboard/*.cy.js"
npm run test:pw -- dashboard/

# Auth:
npm run test:cy -- --spec "cypress/e2e/auth/*.cy.js"
npm run test:pw -- auth/

# Admin:
npm run test:cy -- --spec "cypress/e2e/admin/*.cy.js"
npm run test:pw -- admin/
```

---

## Prerequisite

Backend, frontend, and database running:

```bash
npm run dev
```
