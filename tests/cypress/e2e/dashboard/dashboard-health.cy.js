/**
 * Dashboard – Página Health
 * Requer login admin. Valida cards (API, DB), métricas e JSON bruto.
 */
const Playground = require("../../pages/PlaygroundPage");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../../support/helpers");
const { FRONTEND_URL } = require("../../../shared/constants");

describe("Dashboard – Health", () => {
  beforeEach(() => {
    Playground.visit();
    Playground.fillLoginForm({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    Playground.clickLogin();
    cy.url().should("include", "/dashboard");
    cy.visit(`${FRONTEND_URL}/dashboard/health`);
  });

  it("exibe título e página de health", () => {
    cy.get('[data-testid="page-health"]').should("be.visible");
    cy.contains("Health Check").should("be.visible");
  });

  it("exibe cards de API e Database com status", () => {
    cy.get('[data-testid="health-card-api"]').should("be.visible");
    cy.get('[data-testid="health-card-db"]').should("be.visible");
    cy.get('[data-testid="health-card-api"]').contains(/ok|—/);
    cy.get('[data-testid="health-card-db"]').contains(/ok|error/);
  });

  it("exibe seção JSON bruto com resposta do health", () => {
    cy.contains("JSON bruto").should("be.visible");
    cy.get("pre").should("be.visible").and("contain", "status");
  });
});
