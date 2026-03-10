/**
 * Spec centralizado: API Healthcheck.
 * Única fonte de verdade – Cypress e Playwright consomem este arquivo.
 */
module.exports = {
  title: "API - Healthcheck",
  cases: [
    {
      name: "GET /health responde status ok",
      method: "GET",
      path: "/health",
      expectStatus: 200,
      expectBody: { status: "ok" },
    },
    {
      name: "GET /health inclui db e metrics",
      method: "GET",
      path: "/health",
      expectStatus: 200,
      expectBody: { status: "ok", db: "ok" },
      expectBodyKeys: ["metrics"],
      expectNestedKeys: { metrics: ["apiResponseTimeMs", "apiLastRequestMs", "authSuccessRate", "authTotalAttempts", "testFailureRate", "testRunsSampled"] },
    },
  ],
};
