const { API_BASE } = require('../../support/helpers');

describe('api', () => {
  it('criar usuário com POST /auth/register retorna 201', () => {
    const email = Cypress._.randomEmail();
    const name = Cypress._.randomName();

    cy.request({
      method: 'POST',
      url: `${API_BASE}/auth/register`,
      body: { name, email, password: 'senha123' },
    }).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body).to.have.property('id');
      expect(response.body).to.have.property('name', name);
      expect(response.body).to.have.property('email', email);
    });
  });
});