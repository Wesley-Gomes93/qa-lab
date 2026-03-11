/**
 * Dashboard – Página Métricas
 * Requer login admin. Valida cards de métricas da API e auth.
 */
const { test, expect } = require("@playwright/test");
const { loginAsAdmin } = require("../../support/helpers");

test.describe("Dashboard – Métricas", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("exibe título e página de métricas", async ({ page }) => {
    await page.goto("/dashboard/metricas");
    await expect(page.getByTestId("page-metricas")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Métricas" })).toBeVisible();
  });

  test("exibe card de API Response Time", async ({ page }) => {
    await page.goto("/dashboard/metricas");
    await expect(page.getByTestId("metricas-card-api")).toBeVisible();
    await expect(page.getByRole("heading", { name: "API Response Time" })).toBeVisible();
  });

  test("exibe cards de Auth Success Rate e Test Failure Rate", async ({ page }) => {
    await page.goto("/dashboard/metricas");
    await expect(page.getByRole("heading", { name: "Auth Success Rate" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Test Failure Rate" })).toBeVisible();
  });
});
