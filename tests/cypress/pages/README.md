# Page Objects (mapeamento + funções)

Esta pasta centraliza o **mapeamento dos elementos** da tela e as **ações/funções** reutilizáveis.

## Estrutura

- **`PlaygroundPage.js`** – página inicial do QA Lab (Playground de Testes)
  - `selectors` – todos os locators (data-testid, id, etc.)
  - `texts` – textos esperados na UI (para asserts e manutenção)
  - Funções de navegação: `visit()`, `getHeader()`, `getFormRegister()`, etc.
  - Funções de interação: `fillRegisterForm()`, `clickRegister()`, `clickHealthcheck()`, etc.
  - Funções de assert: `assertHeaderVisible()`, `assertAllElementsVisible()`, `assertValidationErrorVisible()`, etc.

## Uso nos testes

```js
const Playground = require('../pages/PlaygroundPage');

Playground.visit();
Playground.fillRegisterForm({ name: 'João', email: 'joao@teste.com', password: '123' });
Playground.clickRegister();
Playground.assertValidationErrorVisible();
```

## Manutenção

- Se a tela mudar (novo campo, novo texto, novo data-testid), altere **apenas** o arquivo do page object.
- Os testes continuam iguais; a manutenção fica concentrada em um único lugar.
