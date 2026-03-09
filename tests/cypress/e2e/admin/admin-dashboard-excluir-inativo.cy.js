/**
 * E2E: Exclusão de cadastro inativo.
 * Cria um usuário próprio para exclusão e usa a última linha da tabela (evita quebrar outros specs).
 */
const Playground = require('../../pages/PlaygroundPage');
const { ensureAdminTestUsers, waitForDashboardUsers, clickEditOnRow, ADMIN_EMAIL, ADMIN_PASSWORD, randomName, randomEmail, API_BASE } = require('../../support/helpers');

describe('Admin Dashboard - Excluir cadastro inativo', () => {
  before(() => {
    ensureAdminTestUsers();
    cy.request({
      method: 'POST',
      url: `${API_BASE}/auth/register`,
      body: { name: randomName(), email: randomEmail(), password: 'senha123' },
      failOnStatusCode: false,
    });
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

  it('exclui um cadastro inativo', () => {
    cy.on('window:confirm', () => true);
    cy.get('tbody tr').then(($rows) => {
      const lastIndex = $rows.length - 1;
      clickEditOnRow(lastIndex);
      cy.get('[data-testid="modal-edit-ativo"]').uncheck({ force: true });
      cy.get('[data-testid="modal-edit-save"]').click();
      cy.get('[data-testid="modal-edit-idade"]').should('not.exist');

      cy.get('tbody tr').eq(lastIndex).within(() => {
        cy.contains('Não');
        cy.get('[data-testid^="btn-delete-"]').click();
      });
      cy.get('tbody tr').should('have.length', lastIndex);
    });
  });
});
