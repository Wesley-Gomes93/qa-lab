# Comandos – QA Lab (projeto completo)

Referência rápida de **todos os comandos** executáveis pela raiz do projeto.

**Orquestrador:** Use `make help` para ver os targets do [Makefile](../Makefile). Ex.: `make qa`, `make ci`. Ver [Guia Makefile](./MAKEFILE-GUIA.md) para aprender.

---

## Por categoria

### Ambiente (dev)

| Comando | O que faz |
|---------|------------|
| `npm run dev` | Sobe ambiente completo (DB + backend + frontend) |
| `npm run db:up` | Sobe PostgreSQL via Docker |
| `npm run db:down` | Para o PostgreSQL |

### Backend e frontend

| Comando | O que faz |
|---------|------------|
| `npm run backend:install` | Instala deps do backend |
| `npm run backend:dev` | Inicia backend (porta 4000) |
| `npm run frontend:install` | Instala deps do frontend |
| `npm run frontend:dev` | Inicia frontend (porta 3000) |

### Testes (Cypress + Playwright)

| Comando | O que faz |
|---------|------------|
| `npm run tests:install` | Instala deps dos testes |
| `npm run tests:run` | Roda Cypress E2E |
| `npm run tests:pw` | Roda Playwright E2E |
| `npm run tests:pw:ui` | Playwright em modo visual |
| `npm run tests:pw:report` | Abre relatório HTML do Playwright |
| `npm run tests:report:unified` | Gera relatório unificado (Cypress + Playwright) |
| `npm run tests:report:execution` | Relatório de execução (tempos, comparação) |
| `npm run tests:execution` | Roda Cypress + Playwright + relatório de execução |
| `npm run tests:contract` | Contract testing (valida API contra OpenAPI) |
| `npm run tests:report` | Cypress com Mochawesome |
| `npm run tests:clean-users` | Remove usuários @teste.com do banco |
| `npm run tests:full` | Limpa usuários + roda Cypress com relatório |

### QA Extended Lab (Newman + axe)

| Comando | O que faz |
|---------|------------|
| `npm run extended:install` | Instala deps do QA Extended Lab |
| `npm run extended:api` | Newman: 6 testes de API (Users) |
| `npm run extended:api:full` | Newman: 48 testes (todos recursos JSONPlaceholder) |
| `npm run extended:a11y` | axe-core: testes de acessibilidade |
| `npm run extended:all` | Newman + axe em sequência |

**1ª vez:** `npm run extended:install` e `cd qa-extended-lab && npx playwright install chromium` (para a11y).

### Lint

| Comando | O que faz |
|---------|------------|
| `npm run lint` | ESLint em backend, tests, agents |
| `npm run lint:frontend` | ESLint no frontend |
| `npm run lint:backend` | ESLint no backend |
| `npm run lint:tests` | ESLint nos testes |
| `npm run lint:agents` | ESLint nos agentes |
| `npm run lint:check` | Verifica erros e warnings |
| `npm run lint:all` | Lint completo (tudo) |

### Auditoria (Agente Auditor)

| Comando | O que faz |
|---------|------------|
| `npm run audit:context` | Gera contexto completo em `.audit/audit-context.txt` (1ª vez) |
| `npm run audit:context:incremental` | Gera só o delta (o que mudou desde última auditoria) |

**Uso:** Rode antes da auditoria no Cursor. O agente lê 1 arquivo em vez de vários — menos requisições.

### Agentes

| Comando | O que faz |
|---------|------------|
| `npm run agents:install` | Instala deps dos agentes |
| `npm run agent` | Conecta ao MCP e lista ferramentas |
| `npm run agent:run-tests` | Menu interativo para rodar testes (Cypress/Playwright) |
| `npm run agent:demo` | **Demo/GIF:** roda suite API direto (sem menu) |
| `npm run agent:run-tests:api` | Roda suite API direto (modo demo) |
| `npm run agent:run-tests:spec` | Roda só `api-health.cy.js` (rápido) |
| `npm run agent:analyze-failures` | Roda testes e analisa falhas com IA |
| `npm run agent:analyze-failures api` | Roda suite API; analisa se falhar |
| `npm run agent:full` | Limpa usuários + roda testes via agente |
| `npm run agent:test-writer "descrição"` | Gera teste com LLM e roda |

**Para GIF/Post:** veja [Fluxo GIF + Post](./FLUXO-GIF-POST.md).

**Exemplos Test Writer:**
```bash
npm run agent:test-writer "healthcheck da API"
npm run agent:test-writer -- --suite auth "teste de login"
npm run agent:test-writer -- --framework both "API healthcheck"
```

---

## Fluxo típico (começando do zero)

```bash
# 1. Instalar tudo
npm install
npm run frontend:install
npm run backend:install
npm run tests:install
npm run agents:install
npm run extended:install

# 2. Subir ambiente
npm run dev

# 3. Rodar testes da aplicação
npm run tests:run
npm run tests:pw

# 4. Rodar QA Extended Lab (não precisa do app)
npm run extended:api
npm run extended:a11y
```

---

## Ordem lógica (por dependência)

| Ordem | Comando | Quando usar |
|-------|---------|-------------|
| 1 | `npm run dev` | Desenvolvimento local (DB + API + front) |
| 2 | `npm run tests:run` ou `npm run tests:pw` | Testes E2E da aplicação |
| 3 | `npm run extended:api` ou `npm run extended:a11y` | API pública + acessibilidade (independente) |
| 4 | `npm run agent:run-tests` | Menu interativo (precisa do app rodando) |
| 5 | `npm run agent:test-writer "..."` | Gerar teste com LLM (precisa de API key) |
| 6 | `npm run agent:analyze-failures` | Analisar falhas de Cypress |

---

## Links rápidos

- [QA Extended Lab – resumo](../qa-extended-lab/docs/RESUMO-DO-PROJETO.md)
- [QA Extended Lab – CI/CD](../qa-extended-lab/docs/CI-CD.md)
- [Cheat Sheet (privado)](CHEAT-SHEET-PESSOAL.md) — no .gitignore, uso pessoal
- [Pipeline & manutenção](PIPELINE.md)
