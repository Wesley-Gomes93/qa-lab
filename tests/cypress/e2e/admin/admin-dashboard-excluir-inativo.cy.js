/**
 * E2E: Exclusão de cadastro inativo.
 */
const Playground = require('../../pages/PlaygroundPage');
const { ensureAdminTestUsers, ADMIN_EMAIL, ADMIN_PASSWORD } = require('../../support/helpers');

describe('Admin Dashboard - Excluir cadastro inativo', () => {
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

  it('exclui um cadastro inativo', () => {
    cy.get('[data-testid="btn-edit-2"]').click();
    cy.get('[data-testid="modal-edit-ativo"]').uncheck();
    cy.get('[data-testid="modal-edit-save"]').click();
    cy.get('[data-testid="modal-edit-idade"]').should('not.exist');

    cy.get('[data-testid="row-user-2"]').within(() => {
      cy.contains('Não');
    });
    cy.on('window:confirm', () => true);
    cy.get('[data-testid="btn-delete-2"]').click();
    cy.get('[data-testid="row-user-2"]').should('not.exist');
  });
});
