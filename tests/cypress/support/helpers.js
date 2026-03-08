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

module.exports = {
  FRONTEND_URL,
  API_BASE,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  randomAgeBetween18And80,
  randomEmail,
  randomName,
  ensureAdminTestUsers,
};
