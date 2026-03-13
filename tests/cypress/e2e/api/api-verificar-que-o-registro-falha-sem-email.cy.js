const { API_BASE } = require('../../support/helpers');

describe('API', () => {
  it('deve falhar o registro sem email', () => {
    const nome = 'Maria';
    const senha = 'senha123';

    cy.request({
      method: 'POST',
      url: `${API_BASE}/auth/register`,
      body: { name: nome, password: senha },
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.equal(400);
      expect(response.body.error).to.equal('email and password are required');
    });
  });
});