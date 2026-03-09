const { test, expect } = require("@playwright/test");
const {
  ensureAdminTestUsers,
  loginAsAdmin,
  waitForDashboardUsers,
  setRowInactive,
  getUserRow,
} = require("../../support/helpers");

test.describe("Admin Dashboard - Status inativo", () => {
  test.beforeAll(async ({ request }) => {
    await ensureAdminTestUsers(request);
  });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByTestId("filter-users")).toBeVisible();
    await waitForDashboardUsers(page);
  });

  test("altera status de um usuário para inativo", async ({ page }) => {
    await setRowInactive(page, 1);
    await expect(getUserRow(page, 1)).toContainText("Não");
  });
});
