/**
 * E2E: Pesquisa (filtro) por usuário inativo.
 * Usa 1ª linha não-admin (índice 1) e captura o nome da célula para filtrar.
 */
const Playground = require('../../pages/PlaygroundPage');
const { ensureAdminTestUsers, waitForDashboardUsers, clickEditOnRow, getUserRow, ADMIN_EMAIL, ADMIN_PASSWORD } = require('../../support/helpers');

describe('Admin Dashboard - Filtro usuário inativo', () => {
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

  it('pesquisa usuário inativo pelo filtro', () => {
    clickEditOnRow(1);
    cy.get('[data-testid="modal-edit-ativo"]').uncheck({ force: true });
    cy.get('[data-testid="modal-edit-save"]').click();
    cy.get('[data-testid="modal-edit-idade"]').should('not.exist');

    getUserRow(1).then(($row) => {
      const name = $row.find('td').eq(1).text().trim();
      const termo = name || 'User';
      cy.get('[data-testid="filter-users"]').clear({ force: true }).type(termo, { force: true });
      cy.get('tbody tr').should('have.length.at.least', 1);
      cy.get('tbody tr').first().within(() => {
        cy.contains('Não');
      });
    });
  });
});
