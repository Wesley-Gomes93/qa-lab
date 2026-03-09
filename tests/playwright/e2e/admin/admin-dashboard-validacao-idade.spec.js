const { test, expect } = require("@playwright/test");
const {
  ensureAdminTestUsers,
  loginAsAdmin,
  waitForDashboardUsers,
  clickEditOnRow,
} = require("../../support/helpers");

test.describe("Admin Dashboard - Validação de idade 18-80", () => {
  test.beforeAll(async ({ request }) => {
    await ensureAdminTestUsers(request);
  });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByTestId("filter-users")).toBeVisible();
    await waitForDashboardUsers(page);
  });

  test("exibe mensagem quando idade fora do range 18-80", async ({ page }) => {
    await clickEditOnRow(page, 1);
    await page.getByTestId("modal-edit-idade").fill("17");
    await page.getByTestId("modal-edit-save").click();
    await expect(page.getByTestId("modal-edit-error")).toBeVisible();
    await expect(page.getByTestId("modal-edit-error")).toContainText("A idade só pode ser entre 18 e 80");
    await expect(page.getByTestId("modal-edit-idade")).toBeVisible();
  });
});
