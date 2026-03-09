/**
 * E2E: Edição de idade de um usuário não-admin (linha aleatória entre 1ª e 2ª).
 * Usa posição em vez de id fixo — evita quebra quando ids mudam.
 */
const Playground = require('../../pages/PlaygroundPage');
const { ensureAdminTestUsers, waitForDashboardUsers, clickEditOnRow, getUserRow, randomRowIndex, ADMIN_EMAIL, ADMIN_PASSWORD, getEditIdade } = require('../../support/helpers');

describe('Admin Dashboard - Editar idade usuário id 3', () => {
  let rowIndex;

  before(() => {
    ensureAdminTestUsers();
    rowIndex = randomRowIndex(1, 2);
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

  it('edita idade de um usuário não-admin para valor entre 18 e 80', () => {
    const novaIdade = getEditIdade();
    const idx = rowIndex;
    clickEditOnRow(idx);
    cy.get('[data-testid="modal-edit-idade"]').clear({ force: true }).type(String(novaIdade), { force: true });
    cy.get('[data-testid="modal-edit-save"]').click();
    cy.get('[data-testid="modal-edit-idade"]').should('not.exist');
    getUserRow(idx).contains(String(novaIdade));
  });
});
