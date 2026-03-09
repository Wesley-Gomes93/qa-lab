const { test, expect } = require("@playwright/test");
const {
  API_BASE_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  getThresholdMs,
  visitPlayground,
  fillLoginForm,
  clickLogin,
} = require("../../support/helpers");

const DEFAULT_LOAD_MS = 8000;
const DEFAULT_HEALTH_MS = 2000;
const DEFAULT_FORM_VISIBLE_MS = 5000;
const DEFAULT_DASHBOARD_MS = 6000;

test.describe("TICTAC – Performance no caminho crítico", () => {
  test("mede tempo de carregamento completo da página do Playground", async ({ page }) => {
    const loadThreshold = getThresholdMs(["PW_TICTAC_LOAD_MS", "CYPRESS_TICTAC_LOAD_MS"], DEFAULT_LOAD_MS);
    await page.goto("/");

    const loadMs = await page.evaluate(() => {
      const nav = performance.getEntriesByType("navigation")[0];
      if (!nav || nav.loadEventEnd <= 0) return 0;
      return nav.loadEventEnd - nav.fetchStart;
    });

    expect(loadMs).toBeLessThan(loadThreshold);
  });

  test("mede tempo de resposta do healthcheck da API", async ({ request }) => {
    const healthThreshold = getThresholdMs(
      ["PW_TICTAC_HEALTH_MS", "CYPRESS_TICTAC_HEALTH_MS"],
      DEFAULT_HEALTH_MS
    );
    const start = Date.now();
    const res = await request.get(`${API_BASE_URL}/health`);
    const duration = Date.now() - start;

    expect(res.ok()).toBeTruthy();
    expect(duration).toBeLessThan(healthThreshold);
  });

  test("mede tempo até formulário de login estar visível", async ({ page }) => {
    const formThreshold = getThresholdMs(
      ["PW_TICTAC_FORM_VISIBLE_MS", "CYPRESS_TICTAC_FORM_VISIBLE_MS"],
      DEFAULT_FORM_VISIBLE_MS
    );
    const start = Date.now();
    await page.goto("/");
    await expect(page.getByTestId("form-login")).toBeVisible();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(formThreshold);
  });

  test("mede tempo até dashboard estar visível após login", async ({ page }) => {
    const dashboardThreshold = getThresholdMs(
      ["PW_TICTAC_DASHBOARD_MS", "CYPRESS_TICTAC_DASHBOARD_MS"],
      DEFAULT_DASHBOARD_MS
    );
    await visitPlayground(page);
    await expect(page.getByTestId("form-login")).toBeVisible();

    const start = Date.now();
    await fillLoginForm(page, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    await clickLogin(page);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText("Bem-vindo de volta")).toBeVisible();
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(dashboardThreshold);
  });
});
