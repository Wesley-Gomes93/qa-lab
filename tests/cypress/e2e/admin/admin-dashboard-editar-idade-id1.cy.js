/**
 * E2E: Edição de idade do admin (1ª linha da tabela).
 * Usa posição (índice 0) em vez de id fixo.
 */
const Playground = require('../../pages/PlaygroundPage');
const { ensureAdminTestUsers, waitForDashboardUsers, clickEditOnRow, getUserRow, ADMIN_EMAIL, ADMIN_PASSWORD, getEditIdade } = require('../../support/helpers');

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
    waitForDashboardUsers();
  });

  it('edita idade do usuário id 1 (admin) para valor entre 18 e 80', () => {
    const novaIdade = getEditIdade();
    clickEditOnRow(0);
    cy.get('[data-testid="modal-edit-idade"]').clear({ force: true }).type(String(novaIdade), { force: true });
    cy.get('[data-testid="modal-edit-save"]').click();
    cy.get('[data-testid="modal-edit-idade"]').should('not.exist');
    getUserRow(0).contains(String(novaIdade));
  });
});
