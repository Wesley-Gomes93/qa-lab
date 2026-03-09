/**
 * E2E: Alteração de status de usuário para inativo.
 * Usa 1ª linha não-admin (índice 1) em vez de id fixo.
 */
const Playground = require('../../pages/PlaygroundPage');
const { ensureAdminTestUsers, waitForDashboardUsers, clickEditOnRow, getUserRow, ADMIN_EMAIL, ADMIN_PASSWORD } = require('../../support/helpers');

describe('Admin Dashboard - Status inativo', () => {
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

  it('altera status de um usuário para inativo', () => {
    clickEditOnRow(1);
    cy.get('[data-testid="modal-edit-ativo"]').uncheck({ force: true });
    cy.get('[data-testid="modal-edit-save"]').click();
    cy.get('[data-testid="modal-edit-idade"]').should('not.exist');
    getUserRow(1).contains('Não');
  });
});
