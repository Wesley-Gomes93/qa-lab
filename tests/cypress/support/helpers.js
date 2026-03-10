/**
 * Helpers específicos do Cypress.
 * Usa shared/ para constants, factories e selectors.
 * Contém apenas lógica que usa cy.*
 */

const {
  API_BASE_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  USERS_TABLE,
} = require("../../shared/constants");

const {
  randomEmail,
  randomName,
  randomAgeBetween18And80,
  getEditIdade,
} = require("../../shared/factories");

const API_BASE = API_BASE_URL;

// Cypress não usa ensureAdminTestUsers do factories (é sync via cy.request)
// mantemos a versão cy.request aqui
function ensureAdminTestUsers() {
  cy.request({
    method: "POST",
    url: `${API_BASE}/auth/register`,
    body: { name: randomName(), email: randomEmail(), password: "senha123" },
    failOnStatusCode: false,
  });
  cy.request({
    method: "POST",
    url: `${API_BASE}/auth/register`,
    body: { name: randomName(), email: randomEmail(), password: "senha123" },
    failOnStatusCode: false,
  });
}

function waitForDashboardUsers() {
  cy.get(USERS_TABLE, { timeout: 10000 }).should("have.length.at.least", 2);
}

function clickEditOnRow(index) {
  cy.get(USERS_TABLE)
    .eq(index)
    .within(() => {
      cy.get('[data-testid^="btn-edit-"]').click();
    });
}

function getUserRow(index) {
  return cy.get(USERS_TABLE).eq(index);
}

function randomRowIndex(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  FRONTEND_URL: require("../../shared/constants").FRONTEND_URL,
  API_BASE,
  API_BASE_URL: API_BASE,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  USERS_TABLE,
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
