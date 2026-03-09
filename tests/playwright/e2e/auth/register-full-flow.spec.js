const { test, expect } = require("@playwright/test");
const {
  getRegisterName,
  getRegisterEmail,
  getRegisterPassword,
  visitPlayground,
  fillRegisterForm,
  clickRegister,
  assertRegisterSuccessOrAlreadyExists,
} = require("../../support/helpers");

test.describe("Registro - fluxo completo na UI", () => {
  test("preenche formulário, registra e valida resumo de retorno", async ({ page }) => {
    await visitPlayground(page);
    await expect(page.getByTestId("form-register")).toBeVisible();

    await fillRegisterForm(page, {
      name: getRegisterName(),
      email: getRegisterEmail(),
      password: getRegisterPassword(),
    });

    await clickRegister(page);
    await assertRegisterSuccessOrAlreadyExists(page);
  });
});
