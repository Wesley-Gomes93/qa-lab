# How to write tests in Cypress and Playwright

Practical guide for implementing the **same scenario** in both tools.

---

## Project structure

```
tests/
├── shared/           # constants, factories, specs (simple API)
├── cypress/
│   ├── e2e/          # *.cy.js
│   ├── pages/        # Page Objects (Cypress)
│   └── support/      # helpers with cy.*
└── playwright/
    ├── e2e/          # *.spec.js
    └── support/      # helpers with page/request
```

- **shared/** = pure code, no `cy` or `page`
- **cypress/support** and **playwright/support** = framework-specific helpers
- Use the same **data-testid** and **text** for easier equivalence

---

## Example: Login with invalid credentials (login fail)

### What to test

1. Open the Playground page
2. Fill login with invalid email and password
3. Click Login
4. **Do not** redirect to dashboard
5. Show error message (Status: 401, "Invalid credentials")

### Elements used (frontend)

| Element | data-testid |
|---------|-------------|
| Form | `form-login` |
| Email | `login-email` |
| Password | `login-password` |
| Login button | `btn-login` |
| API response | `pre` (sibling of form) |

---

## Cypress

```javascript
// tests/cypress/e2e/auth/login-fail.cy.js
const Playground = require('../../pages/PlaygroundPage');

describe('Login with invalid credentials', () => {
  it('displays 401 error and stays on login screen', () => {
    Playground.visit();
    Playground.getFormLogin().should('be.visible');

    Playground.fillLoginForm({
      email: 'nonexistent@test.com',
      password: 'wrongpassword',
    });
    Playground.clickLogin();

    // Did not redirect
    cy.url().should('not.include', '/dashboard');

    // Error message visible
    Playground.assertLoginFailVisible();
  });
});
```

**Cypress pattern:** chained `cy.*`, async commands managed by the framework.

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

test.describe('Login with invalid credentials', () => {
  test('displays 401 error and stays on login screen', async ({ page }) => {
    await visitPlayground(page);
    await expect(page.getByTestId('form-login')).toBeVisible();

    await fillLoginForm(page, {
      email: 'nonexistent@test.com',
      password: 'wrongpassword',
    });
    await clickLogin(page);

    // Did not redirect
    await expect(page).not.toHaveURL(/\/dashboard/);

    // Error message visible
    await assertLoginFailVisible(page);
  });
});
```

**Playwright pattern:** `async/await`, `page.*` and `expect()`.

---

## Equivalence table

| Action | Cypress | Playwright |
|--------|---------|------------|
| Visit URL | `cy.visit(url)` | `page.goto(url)` |
| Element by testid | `cy.get('[data-testid="x"]')` | `page.getByTestId('x')` |
| Fill input | `cy.get(...).type(text)` | `page.getByTestId('x').fill(text)` |
| Click | `cy.get(...).click()` | `page.getByTestId('x').click()` |
| Check visible | `.should('be.visible')` | `expect(...).toBeVisible()` |
| Check URL | `cy.url().should('include', x)` | `expect(page).toHaveURL(/x/)` |
| Check text | `.should('contain.text', x)` | `expect(await el.textContent()).toContain(x)` |
| Direct HTTP request | `cy.request(...)` | `request.get/post(...)` |

---

## Checklist when adding a test in both

1. **Page Object (Cypress)** – If the page exists, use the Page Object.
2. **Helpers (Playwright)** – Reuse `visitPlayground`, `fillLoginForm`, etc.
3. **Selectors** – Prefer `data-testid` in both.
4. **Same scenario** – Same data, same assertions (UI text, API status).
5. **Run both** – `npm run tests:run` and `npm run tests:pw`.

---

## API tests (single request)

Use **centralized specs** in `tests/shared/specs/api/` – one definition, two runners. See [TESTES-CYPRESS-VS-PLAYWRIGHT.md](./TESTES-CYPRESS-VS-PLAYWRIGHT.md).
