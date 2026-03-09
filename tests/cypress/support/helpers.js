/**
 * Helpers compartilhados pelos testes E2E.
 * Use: const { ADMIN_EMAIL, randomAgeBetween18And80 } = require('../support/helpers');
 */

const FRONTEND_URL = 'http://localhost:3000';
const API_BASE = 'http://localhost:4000';
const ADMIN_EMAIL = 'admWesley@test.com.br';
const ADMIN_PASSWORD = 'senha12356';

function randomAgeBetween18And80() {
  return Math.floor(Math.random() * (80 - 18 + 1)) + 18;
}

/** Idade para edição: usa CYPRESS_EDIT_IDADE (18–80) se definida, senão aleatória. */
function getEditIdade() {
  const env = typeof Cypress !== 'undefined' && Cypress.env && Cypress.env('EDIT_IDADE');
  const n = env != null ? parseInt(env, 10) : NaN;
  if (Number.isFinite(n) && n >= 18 && n <= 80) return n;
  return randomAgeBetween18And80();
}

function randomEmail() {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@teste.com`;
}

function randomName() {
  return `User_${Date.now().toString(36).slice(2, 8)}`;
}

/** Garante que existem usuários com id 2 e 3 (id 1 = ADM do seed). */
function ensureAdminTestUsers() {
  cy.request({
    method: 'POST',
    url: `${API_BASE}/auth/register`,
    body: { name: randomName(), email: randomEmail(), password: 'senha123' },
    failOnStatusCode: false,
  });
  cy.request({
    method: 'POST',
    url: `${API_BASE}/auth/register`,
    body: { name: randomName(), email: randomEmail(), password: 'senha123' },
    failOnStatusCode: false,
  });
}

/** Aguarda a tabela de usuários carregar no dashboard (evita clicar antes dos dados aparecerem). */
function waitForDashboardUsers() {
  cy.get('tbody tr', { timeout: 10000 }).should('have.length.at.least', 2);
}

/**
 * Clica em Editar na linha da tabela por índice (0 = admin, 1 = 1º não-admin, 2 = 2º não-admin).
 * Usa posição em vez de id fixo — evita quebra quando ids mudam.
 */
function clickEditOnRow(index) {
  cy.get('tbody tr').eq(index).within(() => {
    cy.get('[data-testid^="btn-edit-"]').click();
  });
}

/**
 * Retorna a linha da tabela por índice para asserts.
 */
function getUserRow(index) {
  return cy.get('tbody tr').eq(index);
}

/**
 * Escolhe um índice aleatório entre min e max (inclusive) para testes que podem usar qualquer usuário.
 */
function randomRowIndex(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  FRONTEND_URL,
  API_BASE,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  randomAgeBetween18And80,
  getEditIdade,
  randomEmail,
  randomName,
  ensureAdminTestUsers,
  waitForDashboardUsers,
  clickEditOnRow,
  getUserRow,
  randomRowIndex,
};
