# =============================================================================
# QA Lab — Makefile (Orquestrador)
# =============================================================================
# Use: make <target>   ou   make help
# Docs: docs/MAKEFILE-GUIA.md
# =============================================================================

.PHONY: help install dev lint qa qa-all qa-extended security ci audit agent-demo agent-run agent-write backend-test load-test clean

# ---- Default: mostra ajuda ----
.DEFAULT_GOAL := help

# ---- Instalação ----
install: ## Instala todas as dependências do projeto
	npm install
	cd frontend && npm install
	cd backend && npm install
	cd tests && npm install
	cd agents && npm install
	cd qa-extended-lab && npm ci
	cd security-lab/apps/vulnerable-web && npm install
	cd security-lab/apps/practice-web && npm install
	@echo "✓ Instalação concluída"

# ---- Ambiente ----
dev: ## Sobe ambiente completo (DB + backend + frontend)
	npm run dev

db-up: ## Sobe PostgreSQL (Docker)
	npm run db:up

db-down: ## Para PostgreSQL
	npm run db:down

# ---- Lint ----
lint: ## Roda lint em todos os projetos (frontend, backend, tests, agents, scripts, qa-extended-lab)
	npm run lint:check

lint-all: ## Lint completo (frontend + resto)
	npm run lint:all

# ---- QA Lab (app) ----
qa-lint: ## QA: só lint
	npm run lint:check

qa-contract: ## QA: contract testing (OpenAPI)
	npm run tests:contract

qa-cy: ## QA: Cypress E2E
	npm run tests:run

qa-pw: ## QA: Playwright E2E
	npm run tests:pw

qa-pw-security: ## QA: Playwright E2E Security (vulnerable-web :3001)
	npm run tests:pw:security

qa-tests: ## QA: Cypress + Playwright em sequência
	npm run tests:run && npm run tests:pw

qa-report: ## QA: gera relatório unificado
	npm run tests:report:unified

qa: qa-lint qa-contract qa-tests qa-report ## QA Lab completo (lint + contract + E2E + report)
	@echo "✓ QA Lab concluído"

# ---- QA Extended (Newman + axe) ----
qa-extended-install: ## Instala deps do QA Extended
	npm run extended:install

qa-a11y-install-browsers: ## Instala Chromium para testes a11y (requer rede)
	cd qa-extended-lab && npm run install:browsers

qa-extended: ## QA Extended: Newman + axe
	npm run extended:all
	@echo "✓ QA Extended concluído"

report-a11y: ## Gera e abre relatório visual de acessibilidade (axe)
	@echo "Pré-requisitos: make dev rodando (frontend :3000, vulnerable-web :3001)"
	@echo "Se Chromium não estiver instalado: make qa-a11y-install-browsers"
	@cd qa-extended-lab && (npm run test:a11y && open a11y-tests/reports/a11y-report-latest.html) || (echo ""; echo "Erro: 1) Rode 'make dev' em outro terminal"; echo "      2) Instale Chromium: make qa-a11y-install-browsers"; echo "      3) Tente novamente: make report-a11y")

# ---- Backend + Load ----
backend-test: ## Testes unitários da API (supertest)
	npm run backend:test

backend-coverage: ## Coverage da API (c8) — requer make db-up
	npm run backend:coverage

load-test: ## Load test na API (autocannon) — requer API rodando
	npm run load:test

# ---- Security Lab ----
security-scan: ## Security Lab: ZAP, Nuclei, dependency-check, secrets
	npm run security:scan
	@echo "✓ Security scan concluído"

security-e2e: ## Security E2E: Playwright contra vulnerable-web (requer make dev)
	npm run tests:pw:security
	@echo "✓ Security E2E concluído"

security-report: ## Security Lab: gera relatório unificado
	cd security-lab && ./scripts/generate-report.sh

security: security-scan security-report ## Security Lab completo

# ---- QA All (tudo em sequência) ----
# Pré-requisito: make dev rodando em outro terminal (DB + backend + frontend + vulnerable-web)
qa-all: ## QA completo: backend, load, lint, contract, E2E (Cypress+Playwright), extended, security
	@echo ""
	@echo "=========================================="
	@echo "  QA All — rodando todos os testes"
	@echo "  (Certifique-se de que 'make dev' está rodando)"
	@echo "=========================================="
	$(MAKE) backend-test
	$(MAKE) lint
	$(MAKE) qa-contract
	$(MAKE) load-test
	$(MAKE) qa-cy
	$(MAKE) qa-pw
	$(MAKE) qa-extended
	$(MAKE) security-scan
	$(MAKE) qa-report
	@echo ""
	@echo "=========================================="
	@echo "✓ QA All: todos os testes concluídos"
	@echo "=========================================="

# ---- Agent ----
agent-demo: ## Agente: executa testes via MCP (API suite)
	npm run agent:demo

agent-run: ## Agente: menu interativo para rodar testes
	npm run agent:run-tests

agent-write: ## Agente: gera teste com LLM — use: make agent-write PROMPT="descrição"
	@npm run agent:test-writer -- "$(PROMPT)" 2>/dev/null || echo "Use: make agent-write PROMPT=\"teste de login\""

# ---- CI local (simula pipeline) ----
ci: lint qa-contract qa-tests ## Simula pipeline CI (lint + contract + E2E)
	@echo ""
	@echo "=========================================="
	@echo "✓ CI local: todos os checks passaram"
	@echo "=========================================="

ci-full: lint qa-tests qa-extended ## CI completo (+ QA Extended)
	@echo ""
	@echo "=========================================="
	@echo "✓ CI full: QA Lab + QA Extended OK"
	@echo "=========================================="

# ---- Auditoria (Agente Auditor) ----
audit: ## Gera contexto para auditoria (completo)
	npm run audit:context
	@echo "✓ Contexto em .audit/audit-context.txt"

audit-incr: ## Gera contexto incremental (só delta)
	npm run audit:context:incremental

# ---- Utilitários ----
clean: ## Remove artefatos gerados (relatórios, node_modules de build)
	rm -rf tests/cypress/reports tests/playwright-report tests/qa-lab-reports
	@echo "✓ Artefatos removidos"

clean-all: clean ## Remove também .audit e caches
	rm -rf .audit
	@echo "✓ Limpeza completa"

# ---- Help ----
help: ## Mostra esta ajuda
	@echo ""
	@echo "QA Lab — Makefile"
	@echo "================="
	@echo ""
	@echo "Uso: make <target>"
	@echo ""
	@echo "Targets principais:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Exemplos:"
	@echo "  make install    # Instala tudo"
	@echo "  make dev        # Sobe ambiente (em outro terminal)"
	@echo "  make qa-all     # TODOS os testes (backend, load, E2E, security, agent)"
	@echo "  make qa         # QA padrão (lint + contract + E2E)"
	@echo "  make agent-write PROMPT=\"teste de login\"  # Gera teste com LLM"
	@echo "  make help       # Esta ajuda"
	@echo ""
