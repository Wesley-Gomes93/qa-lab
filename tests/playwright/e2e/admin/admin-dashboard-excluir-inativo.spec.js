const { test, expect } = require("@playwright/test");
const {
  API_BASE_URL,
  USERS_TABLE,
  randomName,
  randomEmail,
  ensureAdminTestUsers,
  loginAsAdmin,
  waitForDashboardUsers,
  setRowInactive,
} = require("../../support/helpers");

test.describe("Admin Dashboard - Excluir cadastro inativo", () => {
  test.beforeAll(async ({ request }) => {
    await ensureAdminTestUsers(request);
    await request.post(`${API_BASE_URL}/auth/register`, {
      data: { name: randomName(), email: randomEmail(), password: "senha123" },
    });
  });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByTestId("filter-users")).toBeVisible();
    await waitForDashboardUsers(page);
  });

  test("exclui um cadastro inativo", async ({ page }) => {
    page.on("dialog", (dialog) => dialog.accept());

    const rows = page.locator(USERS_TABLE);
    const countBefore = await rows.count();
    const lastIndex = countBefore - 1;
    expect(lastIndex).toBeGreaterThanOrEqual(0);

    await setRowInactive(page, lastIndex);
    await expect(rows.nth(lastIndex)).toContainText("Não");
    await rows.nth(lastIndex).locator('[data-testid^="btn-delete-"]').click();

    await expect.poll(async () => rows.count()).toBe(lastIndex);
  });
});
