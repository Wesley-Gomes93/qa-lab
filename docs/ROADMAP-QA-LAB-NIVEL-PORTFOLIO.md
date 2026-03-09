# Roadmap – QA Lab em nível portfólio

Este documento descreve a **arquitetura alvo** e as **fases de implementação** para levar o QA Lab ao nível desejado: dashboard de histórico de testes, relatórios visuais (Cypress + mochawesome), observabilidade (logs, métricas, health) e agentes no nível AI QA Engineer.

---

## Arquitetura alvo

```
qa-lab/
├── frontend (Next.js)
│   └── Dashboard: usuários (existente) + histórico de testes + relatórios + métricas + health
├── backend (Node API)
│   └── Observabilidade: logs estruturados, métricas, health detalhado
├── database (PostgreSQL Docker)
│   └── Tabelas: users (existente), test_runs, metrics_snapshots, api_logs (opcional)
├── tests (Cypress)
│   └── Reporter: mochawesome → JSON/HTML + envio de resultados para API
├── agents/
│   ├── QA Agent           → run tests, menu interativo (existente)
│   ├── Test Generator Agent → read PR/code, generate tests
│   └── Failure Analyzer Agent → analyze failures, create bug report
├── mcp-server
│   └── Tools: run_tests, get_users_summary, read_pr, generate_tests, analyze_failures, create_bug_report
└── .github/
    └── CI/CD: workflow que roda testes e envia resultados para o backend
```

---

## Fases de implementação

### Fase 1 – Observabilidade no backend
- **Logs estruturados:** middleware que loga em JSON (timestamp, method, path, status, duration, requestId).
- **Métricas em memória (ou DB):**
  - API response time (por rota ou global).
  - Auth success rate (login success / total attempts).
  - Test failure rate (últimos N runs: failed / total).
- **Health check detalhado:** `GET /health` retorna status da API, do DB e, se disponível, resumo de métricas (ex.: last_test_run, auth_success_rate).

### Fase 2 – Persistência de histórico de testes e métricas
- **Tabelas:**
  - `test_runs`: id, suite/spec, status (passed/failed), duration_ms, total_tests, passed, failed, reported_at, source (ci|agent|manual), metadata (JSON, ex. mochawesome summary).
  - `metrics_snapshots` (opcional): timestamp, api_avg_ms, auth_success_rate, test_failure_rate, etc.
- **Endpoints:**
  - `POST /api/test-runs` (admin ou API key): recebe payload do Cypress/mochawesome ou do CI e grava em `test_runs`.
  - `GET /api/test-runs`: lista histórico (paginação, filtros).
  - `GET /api/metrics` ou dados embutidos em `/health`: métricas atuais para o dashboard.

### Fase 3 – Cypress + mochawesome e envio de resultados
- **Cypress:** configurar reporter `mochawesome` (ou `cypress-mochawesome-reporter`) para gerar JSON + HTML.
- **Script pós-teste:** após `cypress run`, ler o JSON do mochawesome e enviar para `POST /api/test-runs` (local ou CI).
- **CI:** workflow que roda testes, gera relatório e chama a API para registrar o run.

### Fase 4 – Dashboard Next.js (histórico, relatórios, métricas, health)
- **Páginas/abas no dashboard (ou rotas):**
  - Histórico de testes: tabela/cards de `test_runs` (data, suite, status, duração, passed/failed), link para relatório HTML se disponível.
  - Relatórios visuais: lista de runs com link para o relatório mochawesome (HTML hospedado ou artefato do CI).
  - Métricas: cards ou gráficos para API Response Time, Auth Success Rate, Test Failure Rate (dados de `GET /api/metrics` ou `/health`).
  - Health: exibir o payload de `GET /health` (API, DB, opcionalmente dependências).
- **Navegação:** menu ou tabs no dashboard existente (Admin → Usuários | Testes | Métricas | Health).

### Fase 5 – MCP e agentes (AI QA Engineer)
- **Novas tools no MCP:**
  - `read_pr`: recebe diff ou URL de PR e retorna contexto (arquivos alterados, resumo) para o agente.
  - `generate_tests`: recebe contexto (código ou PR) e chama lógica/LLM para sugerir ou gerar specs Cypress (pode ser integração com Test Generator Agent).
  - `analyze_failures`: recebe output de testes falhos (log ou JSON) e retorna análise estruturada (possível integração com Failure Analyzer Agent).
  - `create_bug_report`: gera texto/estrutura de bug report a partir da análise de falhas.
- **Test Generator Agent:** usa `read_pr` + `generate_tests` (e opcionalmente LLM) para propor novos testes.
- **Failure Analyzer Agent:** usa `run_tests` + `analyze_failures` + `suggest_fix` para identificar falhas e **sugerir correções** automaticamente (além de bug report).

### Fase 6 – CI/CD
- **Workflow GitHub Actions:**
  - Trigger: push/PR em branch principal (ou tags).
  - Jobs: start DB (ou use service), start backend, start frontend (ou apenas backend para testes de API), run Cypress.
  - Pós-teste: enviar resultados para `POST /api/test-runs` (backend precisa estar acessível; em alternativa, armazenar artefatos e exibir no dashboard via upload manual ou link para artefato).
- **Documentação:** README ou `docs/CI-CD.md` com instruções para rodar localmente e no CI.

---

## Ordem sugerida de execução

1. **Fase 1** – Observabilidade (logs, métricas, health).  
2. **Fase 2** – DB + endpoints de test-runs e métricas.  
3. **Fase 3** – Cypress mochawesome + script de envio.  
4. **Fase 4** – Dashboard (histórico, relatórios, métricas, health).  
5. **Fase 5** – MCP (novas tools) + Test Generator e Failure Analyzer agents.  
6. **Fase 6** – CI/CD e documentação.

---

## Resumo

| Item | O que é |
|------|--------|
| **Dashboard de histórico** | Página no Next.js que lista `test_runs` (data, suite, status, duração, passed/failed). |
| **Relatórios visuais** | Cypress com mochawesome; links no dashboard para relatórios HTML ou artefatos. |
| **Observabilidade** | Logs JSON, métricas (API response time, auth success rate, test failure rate), health detalhado. |
| **Agentes AI QA** | QA Agent (rodar testes), Test Generator (PR → gerar testes), Failure Analyzer (falhas → análise + bug report). |
| **Estrutura final** | frontend, backend, database, tests, agents (QA, Test Generator, Failure Analyzer), mcp-server, .github. |

Este roadmap serve como guia para implementação faseada; cada fase pode ser entregue e revisada antes de passar à próxima.
