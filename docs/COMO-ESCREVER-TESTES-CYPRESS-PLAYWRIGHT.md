# Como escrever testes em Cypress e Playwright

Guia prático para implementar o **mesmo cenário** nas duas ferramentas.

---

## Estrutura do projeto

```
tests/
├── shared/           # constants, factories, specs (API simples)
├── cypress/
│   ├── e2e/          # *.cy.js
│   ├── pages/        # Page Objects (Cypress)
│   └── support/     # helpers com cy.*
└── playwright/
    ├── e2e/          # *.spec.js
    └── support/      # helpers com page/request
```

- **shared/** = código puro, sem `cy` nem `page`
- **cypress/support** e **playwright/support** = helpers específicos de cada framework
- Use os mesmos **data-testid** e **textos** para facilitar a equivalência

---

## Exemplo: Login com credenciais inválidas (login fail)

### O que testar

1. Abrir a página do Playground
2. Preencher login com e-mail e senha inválidos
3. Clicar em Login
4. **Não** redirecionar para o dashboard
5. Mostrar mensagem de erro (Status: 401, "Credenciais inválidas")

### Elementos usados (frontend)

| Elemento      | data-testid        |
|---------------|--------------------|
| Formulário    | `form-login`       |
| E-mail        | `login-email`      |
| Senha         | `login-password`   |
| Botão Login   | `btn-login`        |
| Resposta API  | `pre` (irmão do form) |

---

## Cypress

```javascript
// tests/cypress/e2e/auth/login-fail.cy.js
const Playground = require('../../pages/PlaygroundPage');

describe('Login com credenciais inválidas', () => {
  it('exibe erro 401 e mantém na tela de login', () => {
    Playground.visit();
    Playground.getFormLogin().should('be.visible');

    Playground.fillLoginForm({
      email: 'naoexiste@teste.com',
      password: 'senhaerrada',
    });
    Playground.clickLogin();

    // Não redirecionou
    cy.url().should('not.include', '/dashboard');

    // Mensagem de erro visível
    Playground.assertLoginFailVisible();
  });
});
```

**Padrão Cypress:** `cy.*` encadeado, comandos assíncronos gerenciados pelo framework.

---

## Playwright

```javascript
// tests/playwright/e2e/auth/login-fail.spec.js
const { test, expect } = require('@playwright/test');
const {
  visitPlayground,
  fillLoginForm,
  clickLogin,
} = require('../../support/helpers');

test.describe('Login com credenciais inválidas', () => {
  test('exibe erro 401 e mantém na tela de login', async ({ page }) => {
    await visitPlayground(page);
    await expect(page.getByTestId('form-login')).toBeVisible();

    await fillLoginForm(page, {
      email: 'naoexiste@teste.com',
      password: 'senhaerrada',
    });
    await clickLogin(page);

    // Não redirecionou
    await expect(page).not.toHaveURL(/\/dashboard/);

    // Mensagem de erro visível
    await assertLoginFailVisible(page);
  });
});
```

**Padrão Playwright:** `async/await`, `page.*` e `expect()`.

---

## Tabela de equivalências

| Ação                    | Cypress                          | Playwright                          |
|-------------------------|----------------------------------|-------------------------------------|
| Visitar URL             | `cy.visit(url)`                  | `page.goto(url)`                    |
| Elemento por testid     | `cy.get('[data-testid="x"]')`    | `page.getByTestId('x')`             |
| Preencher input         | `cy.get(...).type(text)`         | `page.getByTestId('x').fill(text)`   |
| Clicar                  | `cy.get(...).click()`            | `page.getByTestId('x').click()`     |
| Verificar visível       | `.should('be.visible')`          | `expect(...).toBeVisible()`         |
| Verificar URL           | `cy.url().should('include', x)`   | `expect(page).toHaveURL(/x/)`        |
| Verificar texto         | `.should('contain.text', x)`     | `expect(await el.textContent()).toContain(x)` |
| Request HTTP direto     | `cy.request(...)`                | `request.get/post(...)`             |

---

## Checklist ao adicionar teste em ambos

1. **Page Object (Cypress)** – Se existir página, use o Page Object.
2. **Helpers (Playwright)** – Reuse `visitPlayground`, `fillLoginForm`, etc.
3. **Selectors** – Prefira `data-testid` em ambos.
4. **Mesmo cenário** – Mesmos dados, mesmas asserções (texto da UI, Status da API).
5. **Rodar os dois** – `npm run tests:run` e `npm run tests:pw`.

---

## Testes de API (request único)

Use **specs centralizados** em `tests/shared/specs/api/` – uma definição, dois runners. Ver [TESTES-CYPRESS-VS-PLAYWRIGHT.md](./TESTES-CYPRESS-VS-PLAYWRIGHT.md).
