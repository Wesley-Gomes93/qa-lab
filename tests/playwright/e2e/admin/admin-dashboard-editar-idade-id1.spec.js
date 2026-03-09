const { test, expect } = require("@playwright/test");
const {
  getEditIdade,
  ensureAdminTestUsers,
  loginAsAdmin,
  waitForDashboardUsers,
  clickEditOnRow,
  getUserRow,
} = require("../../support/helpers");

test.describe("Admin Dashboard - Editar idade usuário id 1", () => {
  test.beforeAll(async ({ request }) => {
    await ensureAdminTestUsers(request);
  });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByTestId("filter-users")).toBeVisible();
    await waitForDashboardUsers(page);
  });

  test("edita idade do usuário id 1 (admin) para valor entre 18 e 80", async ({ page }) => {
    const novaIdade = getEditIdade();
    await clickEditOnRow(page, 0);
    await page.getByTestId("modal-edit-idade").fill(String(novaIdade));
    await page.getByTestId("modal-edit-save").click();
    await expect(page.getByTestId("modal-edit-idade")).not.toBeVisible();
    await expect(getUserRow(page, 0)).toContainText(String(novaIdade));
  });
});
