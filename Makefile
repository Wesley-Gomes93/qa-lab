# =============================================================================
# QA Lab — Makefile (Orquestrador)
# =============================================================================
# Use: make <target>   ou   make help
# Docs: docs/MAKEFILE-GUIA.md
# =============================================================================

.PHONY: help install dev lint qa qa-extended ci audit clean

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

qa-tests: ## QA: Cypress + Playwright em sequência
	npm run tests:run && npm run tests:pw

qa-report: ## QA: gera relatório unificado
	npm run tests:report:unified

qa: qa-lint qa-contract qa-tests qa-report ## QA Lab completo (lint + contract + E2E + report)
	@echo "✓ QA Lab concluído"

# ---- QA Extended (Newman + axe) ----
qa-extended-install: ## Instala deps do QA Extended
	npm run extended:install

qa-extended: ## QA Extended: Newman + axe
	npm run extended:all
	@echo "✓ QA Extended concluído"

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
	@echo "  make dev        # Sobe ambiente"
	@echo "  make qa         # QA completo"
	@echo "  make ci         # Simula pipeline"
	@echo "  make help       # Esta ajuda"
	@echo ""
