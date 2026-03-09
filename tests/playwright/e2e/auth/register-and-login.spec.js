const { test, expect } = require("@playwright/test");
const { buildRandomUser } = require("../../support/helpers");

test.describe("Auth - registro e login", () => {
  test("registra usuário e faz login com sucesso", async ({ page }) => {
    const user = buildRandomUser();

    await page.goto("/");

    await page.locator("#name").fill(user.name);
    await page.getByTestId("register-email").fill(user.email);
    await page.getByTestId("register-password").fill(user.password);
    await page.getByTestId("btn-register").click();

    const registerResponse = page.locator('[data-testid="form-register"] >> xpath=../pre');
    await expect(registerResponse).toBeVisible();

    // Pode retornar 201 (novo) ou 409 (e-mail já em uso, em reexecuções muito rápidas).
    const registerText = (await registerResponse.textContent()) || "";
    const registerOk =
      (registerText.includes("Status: 201") && registerText.includes('"email"')) ||
      (registerText.includes("Status: 409") && registerText.toLowerCase().includes("já"));
    expect(registerOk).toBeTruthy();

    await page.getByTestId("login-email").fill(user.email);
    await page.getByTestId("login-password").fill(user.password);
    await page.getByTestId("btn-login").click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Bem-vindo de volta")).toBeVisible();
    await expect(page.getByText("Sair")).toBeVisible();
  });
});
