/**
 * Testes de API: criação de usuários, resumo retornado e persistência (GET /users/:id).
 */
const { API_BASE, randomEmail, randomName } = require('../../support/helpers');

describe('API - Criação e resumo de usuários', () => {
  it('cria 2 usuários, verifica resumo na resposta e que estão persistidos (GET /users/:id)', () => {
    const user1 = {
      name: randomName(),
      email: randomEmail(),
      password: 'senha123',
    };

    const user2 = {
      name: randomName(),
      email: randomEmail(),
      password: 'outrasenha',
    };

    let id1;
    let id2;

    cy.request({
      method: 'POST',
      url: `${API_BASE}/auth/register`,
      body: user1,
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('name', user1.name);
      expect(res.body).to.have.property('email', user1.email);
      id1 = res.body.id;
    });

    cy.then(() => {
      cy.request('GET', `${API_BASE}/users/${id1}`).then((getRes) => {
        expect(getRes.status).to.eq(200);
        expect(getRes.body).to.include({ id: id1, name: user1.name, email: user1.email });
      });
    });

    cy.request({
      method: 'POST',
      url: `${API_BASE}/auth/register`,
      body: user2,
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body).to.have.property('id');
      expect(res.body).to.have.property('name', user2.name);
      expect(res.body).to.have.property('email', user2.email);
      id2 = res.body.id;
      expect(id2).to.not.eq(id1);
    });

    cy.then(() => {
      cy.request('GET', `${API_BASE}/users/${id2}`).then((getRes) => {
        expect(getRes.status).to.eq(200);
        expect(getRes.body).to.include({ id: id2, name: user2.name, email: user2.email });
      });
    });
  });
});
