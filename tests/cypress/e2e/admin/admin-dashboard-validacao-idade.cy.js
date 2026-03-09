/**
 * E2E: Validação de idade no modal de edição (range 18-80).
 * Usa 1ª linha não-admin (índice 1) em vez de id fixo.
 */
const Playground = require('../../pages/PlaygroundPage');
const { ensureAdminTestUsers, waitForDashboardUsers, clickEditOnRow, ADMIN_EMAIL, ADMIN_PASSWORD } = require('../../support/helpers');

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
    waitForDashboardUsers();
  });

  it('exibe mensagem quando idade fora do range 18-80', () => {
    clickEditOnRow(1);
    cy.get('[data-testid="modal-edit-idade"]').clear({ force: true }).type('17', { force: true });
    cy.get('[data-testid="modal-edit-save"]').click();
    cy.get('[data-testid="modal-edit-error"]')
      .should('be.visible')
      .and('contain', 'A idade só pode ser entre 18 e 80');
    cy.get('[data-testid="modal-edit-idade"]').should('exist');
  });
});
