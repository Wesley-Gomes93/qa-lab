const { API_BASE, ADMIN_EMAIL, ADMIN_PASSWORD } = require('../../support/helpers');

describe('API - Autenticação', () => {
  it('Login como admin retorna token', () => {
    cy.request({
      method: 'POST',
      url: `${API_BASE}/auth/login`,
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body).to.have.property('token');
      expect(response.body.token).to.not.be.empty;
    });
  });
});