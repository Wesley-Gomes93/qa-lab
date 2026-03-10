# Specs centralizados

Testes definidos uma vez e executados por **Cypress** e **Playwright**.

## Formato

Cada spec exporta:

```js
module.exports = {
  title: "Nome da suíte",
  cases: [
    {
      name: "Descrição do teste",
      method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
      path: "/caminho",
      headers: { ... },     // opcional
      body: { ... },       // opcional
      expectStatus: 200,
      expectBody: { ... }, // match parcial
      expectBodyKeys: ["key1"], // body deve ter essas chaves
      expectNestedKeys: { parent: ["child1"] }, // objeto aninhado
    },
  ],
};
```

## Onde adicionar

- **API (request único):** `shared/specs/api/*.spec.js`
- **Fluxos complexos** (múltiplos requests, dados dinâmicos): mantenha em Cypress e Playwright separados

## Runners

- `cypress/e2e/api/api-shared.cy.js` – executa todos os specs de `shared/specs/api/`
- `playwright/e2e/api/api-shared.spec.js` – idem para Playwright

**Novo spec:** ao criar `shared/specs/api/novo.spec.js`, adicione o require no array de `api-shared.cy.js` e `api-shared.spec.js` (fs/path não funcionam no browser).
