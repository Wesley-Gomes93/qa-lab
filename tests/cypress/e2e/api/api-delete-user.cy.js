/**
 * Teste de API: excluir usuário via DELETE /users/:id.
 * Cria um usuário, exclui via API e verifica que não existe mais.
 */
const { API_BASE, randomEmail, randomName } = require("../../support/helpers");

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-qa-lab";

describe("API - Excluir usuário", () => {
  it("cria usuário, exclui via DELETE /users/:id e verifica 404", () => {
    const user = {
      name: randomName(),
      email: randomEmail(),
      password: "senha123",
    };

    cy.request({
      method: "POST",
      url: `${API_BASE}/auth/register`,
      body: user,
    }).then((res) => {
      expect(res.status).to.eq(201);
      const id = res.body.id;

      cy.request({
        method: "DELETE",
        url: `${API_BASE}/users/${id}`,
        headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        failOnStatusCode: false,
      }).then((delRes) => {
        expect(delRes.status).to.eq(204);
      });

      cy.request({
        method: "GET",
        url: `${API_BASE}/users/${id}`,
        failOnStatusCode: false,
      }).then((getRes) => {
        expect(getRes.status).to.eq(404);
      });
    });
  });
});
