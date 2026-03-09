const { test, expect } = require("@playwright/test");
const {
  FRONTEND_URL,
  randomName,
  randomEmail,
  visitPlayground,
  fillRegisterForm,
  clickRegister,
  assertRegisterSuccessOrAlreadyExists,
  fillLoginForm,
  clickLogin,
} = require("../../support/helpers");

test.describe("Logout", () => {
  test("após login, faz logout e volta para home", async ({ page }) => {
    const name = randomName();
    const email = randomEmail();
    const password = "senha-logout-test";

    await visitPlayground(page);
    await expect(page.getByTestId("form-register")).toBeVisible();
    await fillRegisterForm(page, { name, email, password });
    await clickRegister(page);
    await assertRegisterSuccessOrAlreadyExists(page);

    await fillLoginForm(page, { email, password });
    await clickLogin(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Bem-vindo de volta")).toBeVisible();
    await expect(page.getByTestId("btn-logout")).toBeVisible();

    await page.getByTestId("btn-logout").click();
    await expect(page).toHaveURL(`${FRONTEND_URL}/`);
    await expect(page.getByRole("heading", { level: 1, name: "QA Lab – Playground de Testes" })).toBeVisible();
    await expect(page.getByTestId("form-login")).toBeVisible();

    await page.goto(`${FRONTEND_URL}/dashboard`);
    await expect(page).toHaveURL(`${FRONTEND_URL}/`);
  });
});
