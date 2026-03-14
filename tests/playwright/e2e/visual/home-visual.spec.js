/**
 * Visual regression — garante que o layout da página inicial não mude.
 * Primeira execução: cria baseline. Execuções seguintes: comparam com baseline.
 * Para atualizar baseline: npx playwright test --update-snapshots
 */
const { test, expect } = require("@playwright/test");

test.describe("Visual - página inicial", () => {
  test("layout da homepage deve coincidir com o baseline", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveScreenshot("homepage.png", {
      maxDiffPixels: 100,
    });
  });
});
