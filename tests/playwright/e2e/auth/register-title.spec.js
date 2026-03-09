const { test, expect } = require("@playwright/test");
const { randomName, visitPlayground, fillRegisterForm } = require("../../support/helpers");

test.describe("Registro - título e campos", () => {
  test("valida título e campos do formulário de registro", async ({ page }) => {
    await visitPlayground(page);

    await expect(page.getByRole("heading", { level: 1, name: "QA Lab – Playground de Testes" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "2. Registrar usuário (/auth/register)" })).toBeVisible();

    await expect(page.locator("#name")).toBeVisible();
    await expect(page.getByTestId("register-email")).toBeVisible();
    await expect(page.getByTestId("register-password")).toBeVisible();

    await fillRegisterForm(page, {
      name: randomName(),
      email: `usuario_${Date.now()}@teste.com`,
    });
  });
});
