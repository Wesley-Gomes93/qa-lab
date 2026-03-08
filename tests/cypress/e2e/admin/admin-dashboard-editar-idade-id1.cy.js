/**
 * E2E: Edição de idade do usuário id 1 (valor entre 18 e 80).
 */
const Playground = require('../../pages/PlaygroundPage');
const { ensureAdminTestUsers, ADMIN_EMAIL, ADMIN_PASSWORD, getEditIdade } = require('../../support/helpers');

describe('Admin Dashboard - Editar idade usuário id 1', () => {
  before(() => {
    ensureAdminTestUsers();
  });

  beforeEach(() => {
    Playground.visit();
    Playground.getFormLogin().should('be.visible');
    Playground.fillLoginForm({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    Playground.clickLogin();
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="filter-users"]').should('be.visible');
  });

  it('edita idade do usuário id 1 para valor entre 18 e 80', () => {
    const novaIdade = getEditIdade();
    cy.get('[data-testid="btn-edit-1"]').click();
    cy.get('[data-testid="modal-edit-idade"]').clear().type(String(novaIdade));
    cy.get('[data-testid="modal-edit-save"]').click();
    cy.get('[data-testid="modal-edit-idade"]').should('not.exist');
    cy.get('[data-testid="row-user-1"]').contains(String(novaIdade));
  });
});
