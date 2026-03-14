/**
 * Fluxo completo: criar usuário (com dados informados ou aleatórios),
 * fazer login, logout e verificar persistência no banco.
 * Ao final, o agente mostra resumo via get_users_summary.
 */
const { test, expect } = require("@playwright/test");
const {
  FRONTEND_URL,
  API_BASE_URL,
  ADMIN_TOKEN,
  getRegisterName,
  getRegisterEmail,
  getRegisterPassword,
  visitPlayground,
  fillRegisterForm,
  clickRegister,
  assertRegisterSuccessOrAlreadyExists,
  fillLoginForm,
  clickLogin,
  assertDashboardVisible,
} = require("../../support/helpers");

test.describe("Fluxo completo: criar, login, logout, persistir e resumo", () => {
  test("cadastra usuário, faz login e logout, e verifica que está persistido no banco", async ({ page, request }) => {
    const name = getRegisterName();
    const email = getRegisterEmail();
    const password = getRegisterPassword();

    await visitPlayground(page);
    await expect(page.getByTestId("form-register")).toBeVisible();

    // 1. Registrar (criar)
    await fillRegisterForm(page, { name, email, password });
    await clickRegister(page);
    await assertRegisterSuccessOrAlreadyExists(page);

    // 2. Login
    await fillLoginForm(page, { email, password });
    await clickLogin(page);
    await assertDashboardVisible(page);
    await expect(page.getByTestId("btn-logout")).toBeVisible();

    // 3. Logout
    await page.getByTestId("btn-logout").click();
    await expect(page).toHaveURL(`${FRONTEND_URL}/`);
    await expect(page.getByTestId("form-login")).toBeVisible();

    // 4. Verificar persistência no banco (GET /users com token admin)
    const res = await request.get(`${API_BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(res.ok()).toBeTruthy();
    const users = await res.json();
    expect(Array.isArray(users)).toBeTruthy();
    const user = users.find((u) => u.email === email);
    expect(user).toBeDefined();
    expect(user).toMatchObject({ name, email });
  });
});
