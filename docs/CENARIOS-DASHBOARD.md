# Scenarios – Dashboard (Health, Metrics, History, Navigation)

E2E test suite for the admin dashboard pages. Implemented in Cypress and Playwright.

---

## Scenario matrix

| Spec | Scenario | Cypress | Playwright |
|------|----------|---------|------------|
| **dashboard-health** | Displays health title and page | ✓ | ✓ |
| **dashboard-health** | Displays API and Database cards with status | ✓ | ✓ |
| **dashboard-health** | Displays raw JSON section | ✓ | ✓ |
| **dashboard-metricas** | Displays metrics title and page | ✓ | ✓ |
| **dashboard-metricas** | Displays API Response Time card | ✓ | ✓ |
| **dashboard-metricas** | Displays Auth Rate and Test Failure Rate cards | ✓ | ✓ |
| **dashboard-testes** | Displays history title and page | ✓ | ✓ |
| **dashboard-testes** | Displays table or empty message | ✓ | ✓ |
| **dashboard-navigation** | Navigates Health → Metrics → Tests → Users | ✓ | ✓ |

---

## Files

```
tests/
├── cypress/e2e/dashboard/
│   ├── dashboard-health.cy.js
│   ├── dashboard-metricas.cy.js
│   ├── dashboard-testes.cy.js
│   └── dashboard-navigation.cy.js
└── playwright/e2e/dashboard/
    ├── dashboard-health.spec.js
    ├── dashboard-metricas.spec.js
    ├── dashboard-testes.spec.js
    └── dashboard-navigation.spec.js
```

---

## data-testid added

| Element | data-testid |
|---------|-------------|
| Health page | `page-health` |
| API card (Health) | `health-card-api` |
| DB card (Health) | `health-card-db` |
| Metrics page | `page-metricas` |
| API card (Metrics) | `metricas-card-api` |
| Tests page | `page-testes` |
| Test runs table | `table-test-runs` |
| Empty list | `test-runs-empty` |
| Users link | `nav-usuarios` |
| Tests link | `nav-testes` |
| Metrics link | `nav-metricas` |
| Health link | `nav-health` |

---

## How to run

```bash
# All tests (same scenarios in both frameworks):
npm run test:cy          # Cypress (~24 specs)
npm run test:pw         # Playwright (~26 tests)
npm run test:all        # Both in sequence

# Dashboard only:
npm run test:pw -- dashboard/
npm run test:cy -- --spec "cypress/e2e/dashboard/*.cy.js"   # from inside tests/
```
