/**
 * Dashboard – Página Histórico de testes
 * Requer login admin. Valida tabela ou mensagem vazia.
 */
const Playground = require("../../pages/PlaygroundPage");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../../support/helpers");
const { FRONTEND_URL } = require("../../../shared/constants");

describe("Dashboard – Histórico de testes", () => {
  beforeEach(() => {
    Playground.visit();
    Playground.fillLoginForm({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    Playground.clickLogin();
    cy.url().should("include", "/dashboard");
    cy.visit(`${FRONTEND_URL}/dashboard/testes`);
  });

  it("exibe título e página de histórico", () => {
    cy.get('[data-testid="page-testes"]').should("be.visible");
    cy.contains("Histórico de testes").should("be.visible");
  });

  it("exibe tabela ou mensagem de lista vazia", () => {
    cy.get('[data-testid="table-test-runs"], [data-testid="test-runs-empty"]', {
      timeout: 10000,
    }).should("be.visible");
  });
});
