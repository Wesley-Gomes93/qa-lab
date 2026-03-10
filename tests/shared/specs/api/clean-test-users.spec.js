/**
 * Spec centralizado: limpar usuários de teste.
 * Única fonte de verdade – Cypress e Playwright consomem este arquivo.
 */
const { ADMIN_TOKEN } = require("../../constants");

module.exports = {
  title: "API - Limpar usuários de teste",
  cases: [
    {
      name: "POST /api/clean-test-users retorna ok com contagem",
      method: "POST",
      path: "/api/clean-test-users",
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      expectStatus: 200,
      expectBody: { ok: true },
      expectBodyKeys: ["deleted"],
    },
  ],
};
