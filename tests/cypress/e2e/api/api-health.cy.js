/**
 * Testes de API: healthcheck.
 */
const { API_BASE } = require('../../support/helpers');

describe('API - Healthcheck', () => {
  it('deve responder com status ok', () => {
    cy.request(`${API_BASE}/health`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'ok');
    });
  });
});
