/**
 * Dashboard – Página Métricas
 * Requer login admin. Valida cards de métricas da API e auth.
 */
const Playground = require("../../pages/PlaygroundPage");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../../support/helpers");
const { FRONTEND_URL } = require("../../../shared/constants");

describe("Dashboard – Métricas", () => {
  beforeEach(() => {
    Playground.visit();
    Playground.fillLoginForm({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    Playground.clickLogin();
    cy.url().should("include", "/dashboard");
    cy.visit(`${FRONTEND_URL}/dashboard/metricas`);
  });

  it("exibe título e página de métricas", () => {
    cy.get('[data-testid="page-metricas"]').should("be.visible");
    cy.contains("Métricas").should("be.visible");
  });

  it("exibe card de API Response Time", () => {
    cy.get('[data-testid="metricas-card-api"]').should("be.visible");
    cy.contains("API Response Time").should("be.visible");
  });

  it("exibe cards de Auth Success Rate e Test Failure Rate", () => {
    cy.contains("Auth Success Rate").should("be.visible");
    cy.contains("Test Failure Rate").should("be.visible");
  });
});
