/**
 * Suite E2E completa do painel admin: idade (ids 1–3), validação 18–80,
 * status inativo, filtro e exclusão. Um único arquivo para rodar todo o fluxo.
 */
const Playground = require('../../pages/PlaygroundPage');
const {
  ensureAdminTestUsers,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  API_BASE,
  getEditIdade,
} = require('../../support/helpers');

describe('Admin Dashboard - Suite completa (idade, inativo, filtro, exclusão)', () => {
  let user2Name;

  before(() => {
    ensureAdminTestUsers();
    cy.request({
      method: 'POST',
      url: `${API_BASE}/auth/login`,
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    }).then((loginRes) => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/users`,
        headers: { Authorization: `Bearer ${loginRes.body.token}` },
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

  describe('Edição de idade (18–80)', () => {
    it('edita idade do usuário id 1 para valor entre 18 e 80', () => {
      const novaIdade = getEditIdade();
      cy.get('[data-testid="btn-edit-1"]').click();
      cy.get('[data-testid="modal-edit-idade"]').clear().type(String(novaIdade));
      cy.get('[data-testid="modal-edit-save"]').click();
      cy.get('[data-testid="modal-edit-idade"]').should('not.exist');
      cy.get('[data-testid="row-user-1"]').contains(String(novaIdade));
    });

    it('edita idade do usuário id 2 para valor entre 18 e 80', () => {
      const novaIdade = getEditIdade();
      cy.get('[data-testid="btn-edit-2"]').click();
      cy.get('[data-testid="modal-edit-idade"]').clear().type(String(novaIdade));
      cy.get('[data-testid="modal-edit-save"]').click();
      cy.get('[data-testid="modal-edit-idade"]').should('not.exist');
      cy.get('[data-testid="row-user-2"]').contains(String(novaIdade));
    });

    it('edita idade do usuário id 3 para valor entre 18 e 80', () => {
      const novaIdade = getEditIdade();
      cy.get('[data-testid="btn-edit-3"]').click();
      cy.get('[data-testid="modal-edit-idade"]').clear().type(String(novaIdade));
      cy.get('[data-testid="modal-edit-save"]').click();
      cy.get('[data-testid="modal-edit-idade"]').should('not.exist');
      cy.get('[data-testid="row-user-3"]').contains(String(novaIdade));
    });
  });

  describe('Validação de idade', () => {
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

  describe('Status inativo e filtro', () => {
    it('altera status de um usuário para inativo', () => {
      cy.get('[data-testid="btn-edit-2"]').click();
      cy.get('[data-testid="modal-edit-ativo"]').uncheck();
      cy.get('[data-testid="modal-edit-save"]').click();
      cy.get('[data-testid="modal-edit-idade"]').should('not.exist');
      cy.get('[data-testid="row-user-2"]').contains('Não');
    });

    it('pesquisa usuário inativo pelo filtro', () => {
      const termo = user2Name && user2Name.length > 0 ? user2Name : '2';
      cy.get('[data-testid="filter-users"]').clear().type(termo);
      cy.get('tbody tr').should('have.length.at.least', 1);
      cy.get('[data-testid="row-user-2"]').within(() => {
        cy.contains('Não');
      });
    });
  });

  describe('Exclusão', () => {
    it('exclui um cadastro inativo', () => {
      cy.get('[data-testid="row-user-2"]').within(() => {
        cy.contains('Não');
      });
      cy.on('window:confirm', () => true);
      cy.get('[data-testid="btn-delete-2"]').click();
      cy.get('[data-testid="row-user-2"]').should('not.exist');
    });
  });
});
