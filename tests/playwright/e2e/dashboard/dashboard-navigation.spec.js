/**
 * Dashboard – Navegação entre páginas
 * Valida links do menu admin (Usuários, Testes, Métricas, Health).
 */
const { test, expect } = require("@playwright/test");
const { loginAsAdmin } = require("../../support/helpers");

test.describe("Dashboard – Navegação", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("navega para Health e valida página", async ({ page }) => {
    await page.getByTestId("nav-health").click();
    await expect(page).toHaveURL(/\/dashboard\/health/);
    await expect(page.getByTestId("page-health")).toBeVisible();
  });

  test("navega para Métricas e valida página", async ({ page }) => {
    await page.getByTestId("nav-metricas").click();
    await expect(page).toHaveURL(/\/dashboard\/metricas/);
    await expect(page.getByTestId("page-metricas")).toBeVisible();
  });

  test("navega para Histórico de testes e valida página", async ({ page }) => {
    await page.getByTestId("nav-testes").click();
    await expect(page).toHaveURL(/\/dashboard\/testes/);
    await expect(page.getByTestId("page-testes")).toBeVisible();
  });

  test("navega de volta para Usuários", async ({ page }) => {
    await page.getByTestId("nav-usuarios").click();
    await expect(page).toHaveURL(/\/dashboard\/?$/);
    await expect(page.getByRole("heading", { name: "Todos os usuários" })).toBeVisible();
  });
});
