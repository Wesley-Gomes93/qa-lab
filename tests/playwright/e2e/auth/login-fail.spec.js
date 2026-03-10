/**
 * Login com credenciais inválidas – exibe erro 401.
 */
const { test, expect } = require('@playwright/test');
const {
  visitPlayground,
  fillLoginForm,
  clickLogin,
  assertLoginFailVisible,
} = require('../../support/helpers');

test.describe('Login com credenciais inválidas', () => {
  test('exibe erro 401 e mantém na tela de login', async ({ page }) => {
    await visitPlayground(page);
    await expect(page.getByTestId('form-login')).toBeVisible();

    await fillLoginForm(page, {
      email: 'naoexiste@teste.com',
      password: 'senhaerrada',
    });
    await clickLogin(page);

    // Não redirecionou para o dashboard
    await expect(page).not.toHaveURL(/\/dashboard/);

    // Mensagem de erro visível
    await assertLoginFailVisible(page);
  });
});
