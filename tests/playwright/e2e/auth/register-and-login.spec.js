const { test, expect } = require("@playwright/test");
const {
  getRegisterName,
  getRegisterEmail,
  getRegisterPassword,
  visitPlayground,
  fillRegisterForm,
  clickRegister,
  assertRegisterSuccessOrAlreadyExists,
  fillLoginForm,
  clickLogin,
} = require("../../support/helpers");

test.describe("Auth - registro e login", () => {
  test("registra usuário e faz login com sucesso", async ({ page }) => {
    const name = getRegisterName();
    const email = getRegisterEmail();
    const password = getRegisterPassword();

    await visitPlayground(page);
    await expect(page.getByTestId("form-register")).toBeVisible();
    await fillRegisterForm(page, { name, email, password });
    await clickRegister(page);
    await assertRegisterSuccessOrAlreadyExists(page);

    await fillLoginForm(page, { email, password });
    await clickLogin(page);

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Bem-vindo de volta")).toBeVisible();
    await expect(page.getByText("Sair")).toBeVisible();
  });
});
