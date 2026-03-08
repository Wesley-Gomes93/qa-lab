/**
 * E2E: Validação de idade no modal de edição (range 18-80).
 */
const Playground = require('../../pages/PlaygroundPage');
const { ensureAdminTestUsers, ADMIN_EMAIL, ADMIN_PASSWORD } = require('../../support/helpers');

describe('Admin Dashboard - Validação de idade 18-80', () => {
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

  it('exibe mensagem quando idade fora do range 18-80', () => {
    cy.get('[data-testid="btn-edit-2"]').click();
    cy.get('[data-testid="modal-edit-idade"]').clear().type('17');
    cy.get('[data-testid="modal-edit-save"]').click();
    cy.get('[data-testid="modal-edit-error"]')
      .should('be.visible')
      .and('contain', 'A idade só pode ser entre 18 e 80');
    cy.get('[data-testid="modal-edit-idade"]').should('exist');
  });
});
