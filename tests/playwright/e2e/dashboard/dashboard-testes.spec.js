/**
 * Dashboard – Página Histórico de testes
 * Requer login admin. Valida tabela ou mensagem vazia.
 */
const { test, expect } = require("@playwright/test");
const { loginAsAdmin } = require("../../support/helpers");

test.describe("Dashboard – Histórico de testes", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("exibe título e página de histórico", async ({ page }) => {
    await page.goto("/dashboard/testes");
    await expect(page.getByTestId("page-testes")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Histórico de testes" })).toBeVisible();
  });

  test("exibe tabela ou mensagem de lista vazia", async ({ page }) => {
    await page.goto("/dashboard/testes");
    const table = page.getByTestId("table-test-runs");
    const empty = page.getByTestId("test-runs-empty");
    await expect(table.or(empty)).toBeVisible();
  });
});
