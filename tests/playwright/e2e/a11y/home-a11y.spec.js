/**
 * Testes de acessibilidade (a11y) com axe-core.
 * Detecta violações de WCAG na página inicial.
 */
const { test, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;

test.describe("A11y - página inicial", () => {
  test("página inicial sem violações críticas de acessibilidade", async ({ page }) => {
    await page.goto("/");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const critical = results.violations.filter((v) => v.impact === "critical");
    const serious = results.violations.filter((v) => v.impact === "serious");

    expect(
      critical,
      `Violações críticas: ${JSON.stringify(critical, null, 2)}`
    ).toHaveLength(0);
    expect(
      serious,
      `Violações graves: ${JSON.stringify(serious, null, 2)}`
    ).toHaveLength(0);

    if (results.violations.length > 0) {
      console.log(
        "[a11y] Violações (minor/moderate):",
        results.violations.map((v) => ({ id: v.id, impact: v.impact }))
      );
    }
  });
});
