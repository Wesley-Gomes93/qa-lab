const { test, expect } = require("@playwright/test");
const {
  getEditIdade,
  randomRowIndex,
  ensureAdminTestUsers,
  loginAsAdmin,
  waitForDashboardUsers,
  clickEditOnRow,
  getUserRow,
} = require("../../support/helpers");

test.describe("Admin Dashboard - Editar idade usuário id 2", () => {
  let rowIndex;

  test.beforeAll(async ({ request }) => {
    await ensureAdminTestUsers(request);
    rowIndex = randomRowIndex(1, 2);
  });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByTestId("filter-users")).toBeVisible();
    await waitForDashboardUsers(page);
  });

  test("edita idade de um usuário não-admin para valor entre 18 e 80", async ({ page }) => {
    const novaIdade = getEditIdade();
    await clickEditOnRow(page, rowIndex);
    await page.getByTestId("modal-edit-idade").fill(String(novaIdade));
    await page.getByTestId("modal-edit-save").click();
    await expect(page.getByTestId("modal-edit-idade")).not.toBeVisible();
    await expect(getUserRow(page, rowIndex)).toContainText(String(novaIdade));
  });
});
