/**
 * Dashboard – Navegação entre páginas
 * Valida links do menu admin (Usuários, Testes, Métricas, Health).
 */
const Playground = require("../../pages/PlaygroundPage");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../../support/helpers");

describe("Dashboard – Navegação", () => {
  beforeEach(() => {
    Playground.visit();
    Playground.fillLoginForm({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    Playground.clickLogin();
    cy.url().should("include", "/dashboard");
  });

  it("navega para Health e valida página", () => {
    cy.get('[data-testid="nav-health"]').click();
    cy.url().should("include", "/dashboard/health");
    cy.get('[data-testid="page-health"]').should("be.visible");
  });

  it("navega para Métricas e valida página", () => {
    cy.get('[data-testid="nav-metricas"]').click();
    cy.url().should("include", "/dashboard/metricas");
    cy.get('[data-testid="page-metricas"]').should("be.visible");
  });

  it("navega para Histórico de testes e valida página", () => {
    cy.get('[data-testid="nav-testes"]').click();
    cy.url().should("include", "/dashboard/testes");
    cy.get('[data-testid="page-testes"]').should("be.visible");
  });

  it("navega de volta para Usuários", () => {
    cy.get('[data-testid="nav-usuarios"]').click();
    cy.url().should("match", /\/dashboard\/?$/);
    cy.contains("Todos os usuários").should("be.visible");
  });
});
