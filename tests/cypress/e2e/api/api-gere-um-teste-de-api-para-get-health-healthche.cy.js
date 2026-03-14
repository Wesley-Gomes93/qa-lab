const { API_BASE } = require('../../support/helpers');

describe('API - Healthcheck', () => {
  it('deve realizar healthcheck com sucesso', () => {
    cy.request({
      method: 'GET',
      url: `${API_BASE}/health`,
      failOnStatusCode: false
    }).then(response => {
      expect(response.status).to.eq(200);
      expect(response.body.status).to.eq('ok');
      expect(response.body.db).to.be.oneOf(['ok', 'error']);
      expect(response.body.metrics).to.have.property('apiResponseTimeMs');
      expect(response.body.metrics).to.have.property('apiLastRequestMs');
      expect(response.body.metrics).to.have.property('authSuccessRate');
      expect(response.body.metrics).to.have.property('authTotalAttempts');
      expect(response.body.metrics).to.have.property('testFailureRate');
      expect(response.body.metrics).to.have.property('testRunsSampled');
    });
  });
});