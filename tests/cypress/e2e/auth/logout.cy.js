const Playground = require('../../pages/PlaygroundPage');
const { FRONTEND_URL } = require('../../support/helpers');

describe('Logout', () => {
  it('após login, valida o dashboard, depois faz logout e volta para a home', () => {
    const name = Playground.getRandomName();
    const email = Playground.getRandomEmail();
    const password = 'senha-logout-test';

    Playground.visit();
    Playground.getFormRegister().should('be.visible');
    Playground.fillRegisterForm({ name, email, password });
    Playground.clickRegister();
    Playground.assertRegisterSuccessVisible();

    Playground.fillLoginForm({ email, password });
    Playground.clickLogin();

    cy.url().should('include', '/dashboard');
    cy.contains('Bem-vindo de volta').should('be.visible');
    cy.contains('Sair').should('be.visible');
    cy.get('[data-testid="btn-logout"]').should('be.visible');
    cy.wait(500);
    cy.contains('Olá,').should('be.visible');

    cy.get('[data-testid="btn-logout"]').click();

    cy.url().should('eq', `${FRONTEND_URL}/`);
    cy.contains('QA Lab – Playground de Testes').should('be.visible');
    cy.get('[data-testid="form-login"]').should('be.visible');

    cy.visit(`${FRONTEND_URL}/dashboard`);
    cy.url().should('eq', `${FRONTEND_URL}/`);
  });
});
