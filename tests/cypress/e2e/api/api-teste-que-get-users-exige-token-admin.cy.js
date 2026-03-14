const { API_BASE, ADMIN_EMAIL, ADMIN_PASSWORD } = require('../../support/helpers');

describe('GET /users', () => {
  it('exige token admin', () => {
    cy.request({
      method: 'GET',
      url: `${API_BASE}/users`,
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(403);
    });

    cy.request({
      method: 'POST',
      url: `${API_BASE}/auth/login`,
      body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    }).then((response) => {
      const token = response.body.token;
      cy.request({
        method: 'GET',
        url: `${API_BASE}/users`,
        headers: { Authorization: `Bearer ${token}` }
      }).then((response) => {
        expect(response.status).to.eq(200);
      });
    });
  });
});