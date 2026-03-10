# tests/shared – Código Compartilhado

Pasta com **constants**, **factories** e **selectors** usados por **Cypress** e **Playwright**.

## Estrutura

| Arquivo | Conteúdo |
|---------|----------|
| `constants.js` | URLs, credenciais, USERS_TABLE, AGE_MIN/MAX |
| `factories.js` | randomEmail, randomName, buildRandomUser, getEditIdade |
| `selectors.js` | data-testid e seletores comuns |

## Uso

- **Cypress:** `require('../../shared/constants')` (de dentro de `cypress/support/` ou `cypress/e2e/`)
- **Playwright:** `require('../../shared/constants')` (de dentro de `playwright/support/` ou `playwright/e2e/`)

Os helpers de cada framework (`cypress/support/helpers.js` e `playwright/support/helpers.js`) já importam de `shared/` e reexportam o necessário.

## Regra

- **shared/** = funções puras, sem `cy` ou `page`
- **cypress/** e **playwright/** = lógica específica de cada runner
