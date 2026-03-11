# Como rodar os testes – Cypress e Playwright

Os mesmos cenários estão implementados nos dois frameworks. Use os comandos abaixo.

---

## Comandos principais

| Comando | O que faz |
|---------|-----------|
| `npm run test:cy` | Roda Cypress + **resumo** ao final |
| `npm run test:pw` | Roda Playwright + **resumo** ao final |
| `npm run test:all` | Roda os dois + **resumo unificado** |

Rode sempre da **raiz** do projeto ou de dentro de `tests/`. O resumo exibe: passou, falhou, skip, total e duração.

---

## Suítes equivalentes

| Suíte | Cypress | Playwright |
|-------|---------|------------|
| admin | `cypress/e2e/admin/*.cy.js` | `playwright/e2e/admin/` |
| api | `cypress/e2e/api/*.cy.js` | `playwright/e2e/api/` |
| auth | `cypress/e2e/auth/*.cy.js` | `playwright/e2e/auth/` |
| dashboard | `cypress/e2e/dashboard/*.cy.js` | `playwright/e2e/dashboard/` |
| ui | `cypress/e2e/ui/*.cy.js` | `playwright/e2e/ui/` |
| performance | `cypress/e2e/performance/*.cy.js` | `playwright/e2e/performance/` |

---

## Rodar só uma suíte

```bash
# Dashboard (de dentro de tests/):
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

## Pré-requisito

Backend, frontend e banco rodando:

```bash
npm run dev
```
