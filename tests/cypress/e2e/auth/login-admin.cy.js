const Playground = require('../../pages/PlaygroundPage');
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('../../support/helpers');

describe('Login como Admin', () => {
  it('faz login com ADM e valida que está no dashboard com área de admin', () => {
    Playground.visit();
    Playground.getFormLogin().should('be.visible');

    Playground.fillLoginForm({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    Playground.clickLogin();

    cy.url().should('include', '/dashboard');
    cy.contains('Bem-vindo de volta').should('be.visible');
    cy.contains('Sair').should('be.visible');
    cy.contains('(Admin)').should('be.visible');
    cy.contains('Todos os usuários').should('be.visible');
  });
});
