/**
 * Testes de API: healthcheck.
 */
describe('API - Healthcheck', () => {
  it('deve responder com status ok', () => {
    cy.request('/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'ok');
    });
  });
});
