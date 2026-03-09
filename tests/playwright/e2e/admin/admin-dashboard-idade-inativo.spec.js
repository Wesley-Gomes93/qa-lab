const { test, expect } = require("@playwright/test");
const {
  USERS_TABLE,
  getEditIdade,
  ensureAdminTestUsers,
  loginAsAdmin,
  waitForDashboardUsers,
  clickEditOnRow,
  getUserRow,
  setRowInactive,
} = require("../../support/helpers");

test.describe("Admin Dashboard - Suite completa (idade, inativo, filtro, exclusão)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async ({ request }) => {
    await ensureAdminTestUsers(request);
  });

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByTestId("filter-users")).toBeVisible();
    await waitForDashboardUsers(page);
  });

  test("edita idade do admin (1ª linha) para valor entre 18 e 80", async ({ page }) => {
    const novaIdade = getEditIdade();
    await clickEditOnRow(page, 0);
    await page.getByTestId("modal-edit-idade").fill(String(novaIdade));
    await page.getByTestId("modal-edit-save").click();
    await expect(page.getByTestId("modal-edit-idade")).not.toBeVisible();
    await expect(getUserRow(page, 0)).toContainText(String(novaIdade));
  });

  test("edita idade do 1º não-admin (2ª linha) para valor entre 18 e 80", async ({ page }) => {
    const novaIdade = getEditIdade();
    await clickEditOnRow(page, 1);
    await page.getByTestId("modal-edit-idade").fill(String(novaIdade));
    await page.getByTestId("modal-edit-save").click();
    await expect(page.getByTestId("modal-edit-idade")).not.toBeVisible();
    await expect(getUserRow(page, 1)).toContainText(String(novaIdade));
  });

  test("edita idade do 2º não-admin (3ª linha) para valor entre 18 e 80", async ({ page }) => {
    const novaIdade = getEditIdade();
    await clickEditOnRow(page, 2);
    await page.getByTestId("modal-edit-idade").fill(String(novaIdade));
    await page.getByTestId("modal-edit-save").click();
    await expect(page.getByTestId("modal-edit-idade")).not.toBeVisible();
    await expect(getUserRow(page, 2)).toContainText(String(novaIdade));
  });

  test("exibe mensagem quando idade fora do range 18-80", async ({ page }) => {
    await clickEditOnRow(page, 1);
    await page.getByTestId("modal-edit-idade").fill("17");
    await page.getByTestId("modal-edit-save").click();
    await expect(page.getByTestId("modal-edit-error")).toBeVisible();
    await expect(page.getByTestId("modal-edit-error")).toContainText("A idade só pode ser entre 18 e 80");
    await expect(page.getByTestId("modal-edit-idade")).toBeVisible();
  });

  test("altera status do 1º não-admin para inativo", async ({ page }) => {
    await setRowInactive(page, 1);
    await expect(getUserRow(page, 1)).toContainText("Não");
  });

  test("pesquisa usuário inativo pelo filtro", async ({ page }) => {
    const rowName = ((await getUserRow(page, 1).locator("td").nth(1).textContent()) || "").trim();
    const termo = rowName || "User";
    await page.getByTestId("filter-users").fill(termo);
    await expect.poll(async () => page.locator(USERS_TABLE).count()).toBeGreaterThanOrEqual(1);
    await expect(page.locator(USERS_TABLE).first()).toContainText("Não");
  });

  test("exclui o cadastro inativo (1º não-admin)", async ({ page }) => {
    page.on("dialog", (dialog) => dialog.accept());

    const rows = page.locator(USERS_TABLE);
    const countBefore = await rows.count();
    expect(countBefore).toBeGreaterThan(1);
    await expect(getUserRow(page, 1)).toContainText("Não");
    await getUserRow(page, 1).locator('[data-testid^="btn-delete-"]').click();
    await expect.poll(async () => rows.count()).toBe(countBefore - 1);
  });
});
