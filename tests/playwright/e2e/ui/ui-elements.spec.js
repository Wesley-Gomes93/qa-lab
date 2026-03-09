const { test, expect } = require("@playwright/test");

test.describe("UI - elementos da tela inicial", () => {
  test("valida header, seções, formulários e botões principais", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: "QA Lab – Playground de Testes" })).toBeVisible();
    await expect(page.getByText("URL da API usada pelo site:")).toBeVisible();
    await expect(page.getByText("http://localhost:4000")).toBeVisible();

    await expect(page.getByRole("heading", { level: 2, name: "1. Healthcheck da API" })).toBeVisible();
    await expect(page.getByTestId("btn-healthcheck")).toBeVisible();
    await expect(page.getByTestId("btn-healthcheck")).toHaveText("Testar /health");

    await expect(page.getByRole("heading", { level: 2, name: "2. Registrar usuário (/auth/register)" })).toBeVisible();
    await expect(page.getByTestId("form-register")).toBeVisible();
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.getByTestId("register-email")).toBeVisible();
    await expect(page.getByTestId("register-password")).toBeVisible();
    await expect(page.getByTestId("btn-register")).toBeVisible();

    await expect(page.getByRole("heading", { level: 2, name: "3. Login (/auth/login)" })).toBeVisible();
    await expect(page.getByTestId("form-login")).toBeVisible();
    await expect(page.getByTestId("login-email")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();
    await expect(page.getByTestId("btn-login")).toBeVisible();
  });
});
