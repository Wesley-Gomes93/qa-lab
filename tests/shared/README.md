# tests/shared – Código Compartilhado

Pasta com **constants**, **factories** e **selectors** usados por **Cypress** e **Playwright**.

## Estrutura

| Arquivo/Pasta | Conteúdo |
|---------------|----------|
| `constants.js` | URLs, credenciais, USERS_TABLE, AGE_MIN/MAX |
| `factories.js` | randomEmail, randomName, buildRandomUser, getEditIdade |
| `selectors.js` | data-testid e seletores comuns |
| `specs/api/` | **Specs centralizados** – definições de testes de API (Cypress e Playwright consomem) |

## Uso

- **Cypress:** `require('../../shared/constants')` (de dentro de `cypress/support/` ou `cypress/e2e/`)
- **Playwright:** `require('../../shared/constants')` (de dentro de `playwright/support/` ou `playwright/e2e/`)

Os helpers de cada framework (`cypress/support/helpers.js` e `playwright/support/helpers.js`) já importam de `shared/` e reexportam o necessário.

## Specs centralizados

Testes de API com **request único** ficam em `specs/api/*.spec.js`. Cypress e Playwright executam via `api-shared.cy.js` e `api-shared.spec.js`. Ver `specs/README.md`.

## Regra

- **shared/** = funções puras, sem `cy` ou `page`
- **specs/** = definições declarativas (sem lógica de runner)
- **cypress/** e **playwright/** = lógica específica de cada runner
