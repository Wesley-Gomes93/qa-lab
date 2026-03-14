/**
 * Fluxo completo: criar usuário (com dados informados ou aleatórios),
 * fazer login, logout e verificar persistência no banco.
 * Ao final, o agente mostra resumo via get_users_summary.
 */
const Playground = require('../../pages/PlaygroundPage');
const { API_BASE_URL, ADMIN_TOKEN } = require('../../../shared/constants');
const { FRONTEND_URL } = require('../../support/helpers');

describe('Fluxo completo: criar, login, logout, persistir e resumo', () => {
  it('cadastra usuário, faz login e logout, e verifica que está persistido no banco', () => {
    const name = Playground.getRegisterName();
    const email = Playground.getRegisterEmail();
    const password = Playground.getRegisterPassword();

    Playground.visit();
    Playground.getFormRegister().should('be.visible');

    // 1. Registrar (criar)
    Playground.fillRegisterForm({ name, email, password });
    Playground.clickRegister();
    Playground.assertRegisterSuccessOrAlreadyExists();

    // 2. Login
    Playground.fillLoginForm({ email, password });
    Playground.clickLogin();
    cy.url().should('include', '/dashboard');
    cy.contains('Bem-vindo de volta').should('be.visible');
    cy.contains('Sair').should('be.visible');
    cy.get('[data-testid="btn-logout"]').should('be.visible');
    cy.wait(500); // permite dashboard estabilizar (como em logout.cy.js)
    cy.contains('Olá,').should('be.visible');

    // 3. Logout
    cy.get('[data-testid="btn-logout"]').click();
    cy.url().should('eq', `${FRONTEND_URL}/`);
    cy.get('[data-testid="form-login"]').should('be.visible');

    // 4. Verificar persistência no banco (GET /users com token admin)
    cy.request({
      method: 'GET',
      url: `${API_BASE_URL}/users`,
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.be.an('array');
      const user = res.body.find((u) => u.email === email);
      expect(user, `Usuário ${email} deve estar persistido no banco`).to.exist;
      expect(user).to.include({ name, email });
    });
  });
});
