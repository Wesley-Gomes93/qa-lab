const { test, expect } = require("@playwright/test");
const {
  USERS_TABLE,
  ensureAdminTestUsers,
  loginAsAdmin,
  waitForDashboardUsers,
  setRowInactive,
  getUserRow,
} = require("../../support/helpers");

test.describe("Admin Dashboard - Filtro usuário inativo", () => {
  test.beforeAll(async ({ request }) => {
    await ensureAdminTestUsers(request);
  });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByTestId("filter-users")).toBeVisible();
    await waitForDashboardUsers(page);
  });

  test("pesquisa usuário inativo pelo filtro", async ({ page }) => {
    await setRowInactive(page, 1);

    const rowName = ((await getUserRow(page, 1).locator("td").nth(1).textContent()) || "").trim();
    const termo = rowName || "User";

    await page.getByTestId("filter-users").fill(termo);
    await expect.poll(async () => page.locator(USERS_TABLE).count()).toBeGreaterThanOrEqual(1);
    await expect(page.locator(USERS_TABLE).first()).toContainText("Não");
  });
});
