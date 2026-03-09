/**
 * Suite E2E completa do painel admin: edição de idade (linhas 0, 1, 2),
 * validação 18–80, status inativo, filtro e exclusão.
 * Usa posição (índice da linha) em vez de id fixo.
 */
const Playground = require('../../pages/PlaygroundPage');
const {
  ensureAdminTestUsers,
  waitForDashboardUsers,
  clickEditOnRow,
  getUserRow,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  getEditIdade,
} = require('../../support/helpers');

describe('Admin Dashboard - Suite completa (idade, inativo, filtro, exclusão)', () => {
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

  describe('Edição de idade (18–80)', () => {
    it('edita idade do admin (1ª linha) para valor entre 18 e 80', () => {
      const novaIdade = getEditIdade();
      clickEditOnRow(0);
      cy.get('[data-testid="modal-edit-idade"]').clear({ force: true }).type(String(novaIdade), { force: true });
      cy.get('[data-testid="modal-edit-save"]').click();
      cy.get('[data-testid="modal-edit-idade"]').should('not.exist');
      getUserRow(0).contains(String(novaIdade));
    });

    it('edita idade do 1º não-admin (2ª linha) para valor entre 18 e 80', () => {
      const novaIdade = getEditIdade();
      clickEditOnRow(1);
      cy.get('[data-testid="modal-edit-idade"]').clear({ force: true }).type(String(novaIdade), { force: true });
      cy.get('[data-testid="modal-edit-save"]').click();
      cy.get('[data-testid="modal-edit-idade"]').should('not.exist');
      getUserRow(1).contains(String(novaIdade));
    });

    it('edita idade do 2º não-admin (3ª linha) para valor entre 18 e 80', () => {
      const novaIdade = getEditIdade();
      clickEditOnRow(2);
      cy.get('[data-testid="modal-edit-idade"]').clear({ force: true }).type(String(novaIdade), { force: true });
      cy.get('[data-testid="modal-edit-save"]').click();
      cy.get('[data-testid="modal-edit-idade"]').should('not.exist');
      getUserRow(2).contains(String(novaIdade));
    });
  });

  describe('Validação de idade', () => {
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

  describe('Status inativo e filtro', () => {
    it('altera status do 1º não-admin para inativo', () => {
      clickEditOnRow(1);
      cy.get('[data-testid="modal-edit-ativo"]').uncheck({ force: true });
      cy.get('[data-testid="modal-edit-save"]').click();
      cy.get('[data-testid="modal-edit-idade"]').should('not.exist');
      getUserRow(1).contains('Não');
    });

    it('pesquisa usuário inativo pelo filtro', () => {
      getUserRow(1).then(($row) => {
        const name = $row.find('td').eq(1).text().trim();
        const termo = name || 'User';
        cy.get('[data-testid="filter-users"]').clear({ force: true }).type(termo, { force: true });
        cy.get('tbody tr').should('have.length.at.least', 1);
        cy.get('tbody tr').first().within(() => cy.contains('Não'));
      });
    });
  });

  describe('Exclusão', () => {
    it('exclui o cadastro inativo (1º não-admin)', () => {
      cy.on('window:confirm', () => true);
      getUserRow(1).within(() => {
        cy.contains('Não');
        cy.get('[data-testid^="btn-delete-"]').click();
      });
      cy.get('tbody tr').should('have.length', 2);
    });
  });
});
