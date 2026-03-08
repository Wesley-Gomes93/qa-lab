/**
 * E2E: Pesquisa (filtro) por usuário inativo.
 */
const Playground = require('../../pages/PlaygroundPage');
const { ensureAdminTestUsers, ADMIN_EMAIL, ADMIN_PASSWORD, API_BASE } = require('../../support/helpers');

describe('Admin Dashboard - Filtro usuário inativo', () => {
  let user2Name;

  before(() => {
    ensureAdminTestUsers();
    cy.request({
      method: 'POST',
      url: `${API_BASE}/auth/login`,
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    }).then((loginRes) => {
      const token = loginRes.body.token;
      cy.request({
        method: 'GET',
        url: `${API_BASE}/users`,
        headers: { Authorization: `Bearer ${token}` },
      }).then((usersRes) => {
        const user2 = usersRes.body.find((u) => u.id === 2);
        if (user2) user2Name = user2.name;
      });
    });
  });

  beforeEach(() => {
    Playground.visit();
    Playground.getFormLogin().should('be.visible');
    Playground.fillLoginForm({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    Playground.clickLogin();
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="filter-users"]').should('be.visible');
  });

  it('pesquisa usuário inativo pelo filtro', () => {
    cy.get('[data-testid="btn-edit-2"]').click();
    cy.get('[data-testid="modal-edit-ativo"]').uncheck();
    cy.get('[data-testid="modal-edit-save"]').click();
    cy.get('[data-testid="modal-edit-idade"]').should('not.exist');

    const termo = user2Name && user2Name.length > 0 ? user2Name : '2';
    cy.get('[data-testid="filter-users"]').clear().type(termo);
    cy.get('tbody tr').should('have.length.at.least', 1);
    cy.get('[data-testid="row-user-2"]').within(() => {
      cy.contains('Não');
    });
  });
});
