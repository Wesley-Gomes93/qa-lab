/**
 * Dashboard – Página Health
 * Requer login admin. Valida cards (API, DB), métricas e JSON bruto.
 */
const { test, expect } = require("@playwright/test");
const { loginAsAdmin } = require("../../support/helpers");

test.describe("Dashboard – Health", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("exibe título e página de health", async ({ page }) => {
    await page.goto("/dashboard/health");
    await expect(page.getByTestId("page-health")).toBeVisible();
    await expect(page.getByText("Health Check")).toBeVisible();
  });

  test("exibe cards de API e Database com status", async ({ page }) => {
    await page.goto("/dashboard/health");
    await expect(page.getByTestId("health-card-api")).toBeVisible();
    await expect(page.getByTestId("health-card-db")).toBeVisible();
    await expect(page.getByTestId("health-card-api")).toContainText(/ok|—/);
    await expect(page.getByTestId("health-card-db")).toContainText(/ok|error/);
  });

  test("exibe seção JSON bruto com resposta do health", async ({ page }) => {
    await page.goto("/dashboard/health");
    await expect(page.getByText("JSON bruto")).toBeVisible();
    await expect(page.locator("pre")).toBeVisible();
    await expect(page.locator("pre")).toContainText("status");
  });
});
