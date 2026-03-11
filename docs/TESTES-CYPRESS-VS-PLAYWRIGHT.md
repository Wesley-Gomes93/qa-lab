# Cypress vs Playwright – Strategy and maintenance

## Centralized specs (no duplication)

**Single-request API tests** live in **`tests/shared/specs/api/`** – one definition, two runners.

```
tests/shared/specs/api/
├── health.spec.js
├── clean-test-users.spec.js
└── README.md
```

- **Cypress** runs via `api-shared.cy.js`
- **Playwright** runs via `api-shared.spec.js`

**To add a new simple API test:** create a file in `shared/specs/api/` following the format in `README.md`. Both runners pick it up automatically.

**Complex flows** (multiple requests, dynamic data) stay in separate files per framework.

---

## Why both?

QA Lab keeps **Cypress** and **Playwright** in parallel for:

1. **Learning** – Compare tools, APIs, and reports
2. **Resilience** – Two implementations increase confidence in critical flows
3. **Portfolio** – Show experience with both tools
4. **Pipeline** – They run in parallel in CI (total ~4min)

## Current structure

| Suite | Cypress | Playwright | Note |
|-------|---------|------------|------|
| api | ✓ | ✓ | Same scenarios |
| auth | ✓ | ✓ | Same scenarios |
| admin | ✓ | ✓ | Same scenarios |
| dashboard | ✓ | ✓ | Same scenarios |
| ui | ✓ | ✓ | Same scenarios |
| performance | ✓ | ✓ | TICTAC in both |

**Cypress:** `tests/cypress/e2e/**/*.cy.js`  
**Playwright:** `tests/playwright/e2e/**/*.spec.js`

Both use `tests/shared/` (constants, factories) and framework-specific helpers in `support/`.

---

## Maintenance strategy

### Rule 1: Cypress is the primary source

- **New tests:** Create first in Cypress (`tests/cypress/e2e/`)
- **Test Writer Agent:** Generates Cypress specs by default
- **Failure Analyzer:** Analyzes Cypress failures

### Rule 2: Playwright mirrors the critical paths

- **Don't duplicate everything** – Prioritize: api, auth, admin, performance (TICTAC)
- When adding a new important scenario in Cypress, evaluate if it's worth adding to Playwright
- Very specific tests (e.g. `admin-dashboard-editar-idade-id2`) can stay Cypress-only

### Rule 3: Keep parity in suites, not in files

It's not required to have the same number of specs in both. What matters:

- **api, auth, admin** – Equivalent coverage in main flows
- **ui, performance** – Keep TICTAC and critical elements in both

### Rule 4: When modifying a flow

1. Change in **Cypress** first
2. If Playwright has the same test, update it too
3. Run `npm run tests:run` and `npm run tests:pw` before pushing

---

## When to consolidate to one?

Consider migrating to **Playwright only** if:

- Dual maintenance takes too much time
- Focus is CI speed (Playwright tends to be faster)
- You want to simplify onboarding for other devs

**Steps to consolidate:** Migrate remaining Cypress specs to Playwright, remove Cypress from pipeline, document the decision.

---

## Commands

```bash
npm run tests:run          # Cypress
npm run tests:pw           # Playwright
npm run tests:report:unified  # Unified report
```

---

## Summary

| Action | Where to do first | Replicate in other? |
|--------|------------------|---------------------|
| New API test | Cypress | Yes, if main flow |
| New auth test | Cypress | Yes |
| New admin test | Cypress | Evaluate (critical = yes) |
| Bug fix | Where the test exists | If it exists in both |
| Test Writer | Generates Cypress | Manual if needed |
