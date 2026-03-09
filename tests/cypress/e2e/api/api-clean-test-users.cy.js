/**
 * Teste de API: limpar usuários de teste via POST /api/clean-test-users.
 * Verifica que o endpoint retorna ok e a quantidade excluída.
 */
const { API_BASE } = require("../../support/helpers");

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-qa-lab";

describe("API - Limpar usuários de teste", () => {
  it("chama POST /api/clean-test-users e retorna ok com contagem", () => {
    cy.request({
      method: "POST",
      url: `${API_BASE}/api/clean-test-users`,
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("ok", true);
      expect(res.body).to.have.property("deleted");
      expect(res.body.deleted).to.be.a("number");
    });
  });
});
