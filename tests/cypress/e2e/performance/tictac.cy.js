/**
 * TICTAC – Teste de performance no caminho crítico
 *
 * TICTAC = Time-based Interaction & Critical path Testing for Application Compliance.
 * Mede tempos no fluxo crítico: carregamento da página, API health, tempo até
 * formulário visível e até dashboard visível após login.
 *
 * Limites (ms) podem ser sobrescritos via Cypress.env():
 *   TICTAC_LOAD_MS, TICTAC_HEALTH_MS, TICTAC_FORM_VISIBLE_MS, TICTAC_DASHBOARD_MS
 */
const Playground = require('../../pages/PlaygroundPage');
const { FRONTEND_URL, API_BASE, ADMIN_EMAIL, ADMIN_PASSWORD } = require('../../support/helpers');

const DEFAULT_LOAD_MS = 8000;
const DEFAULT_HEALTH_MS = 2000;
const DEFAULT_FORM_VISIBLE_MS = 5000;
const DEFAULT_DASHBOARD_MS = 6000;

function getThreshold(name, defaultMs) {
  const env = typeof Cypress !== 'undefined' && Cypress.env && Cypress.env(name);
  const n = env != null ? parseInt(env, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : defaultMs;
}

describe('TICTAC – Performance no caminho crítico', () => {
  it('mede tempo de carregamento completo da página do Playground', () => {
    const loadThreshold = getThreshold('TICTAC_LOAD_MS', DEFAULT_LOAD_MS);

    cy.visit(FRONTEND_URL);

    cy.window().then((win) => {
      const nav = win.performance.getEntriesByType('navigation')[0];
      const loadMs = nav && nav.loadEventEnd > 0 ? nav.loadEventEnd - nav.fetchStart : 0;
      cy.log(`TICTAC: loadEventEnd - fetchStart = ${loadMs} ms (limite: ${loadThreshold} ms)`);
      expect(loadMs).to.be.lessThan(loadThreshold);
    });
  });

  it('mede tempo de resposta do healthcheck da API', () => {
    const healthThreshold = getThreshold('TICTAC_HEALTH_MS', DEFAULT_HEALTH_MS);
    const start = Date.now();

    cy.request({ url: `${API_BASE}/health`, failOnStatusCode: false }).then(() => {
      const duration = Date.now() - start;
      cy.log(`TICTAC: GET /health = ${duration} ms (limite: ${healthThreshold} ms)`);
      expect(duration).to.be.lessThan(healthThreshold);
    });
  });

  it('mede tempo até o formulário de login estar visível (Time to Interactive)', () => {
    const formThreshold = getThreshold('TICTAC_FORM_VISIBLE_MS', DEFAULT_FORM_VISIBLE_MS);
    let start;

    cy.visit(FRONTEND_URL).then(() => {
      start = Date.now();
    });
    Playground.getFormLogin().should('be.visible').then(() => {
      const elapsed = Date.now() - start;
      cy.log(`TICTAC: tempo até form login visível = ${elapsed} ms (limite: ${formThreshold} ms)`);
      expect(elapsed).to.be.lessThan(formThreshold);
    });
  });

  it('mede tempo até o dashboard estar visível após login (caminho crítico)', () => {
    const dashboardThreshold = getThreshold('TICTAC_DASHBOARD_MS', DEFAULT_DASHBOARD_MS);
    let start;

    Playground.visit();
    Playground.getFormLogin().should('be.visible');
    start = Date.now();
    Playground.fillLoginForm({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    Playground.clickLogin();

    cy.url().should('include', '/dashboard');
    cy.contains('Bem-vindo de volta').should('be.visible').then(() => {
      const elapsed = Date.now() - start;
      cy.log(`TICTAC: tempo até dashboard visível após login = ${elapsed} ms (limite: ${dashboardThreshold} ms)`);
      expect(elapsed).to.be.lessThan(dashboardThreshold);
    });
  });
});
