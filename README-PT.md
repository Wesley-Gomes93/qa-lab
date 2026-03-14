# QA Lab 🧪

[![Pipeline](https://img.shields.io/github/actions/workflow/status/Wesley-Gomes93/qa-lab/pipeline.yml?branch=main&label=build)](https://github.com/Wesley-Gomes93/qa-lab/actions)
[![Node](https://img.shields.io/badge/node-20.x-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**QA portfolio.** Um lab que construí para praticar e aprofundar meu ofício — automação E2E, testes de API, validação de contrato e CI/CD. O que aprendi no caminho está documentado aqui.

**Laboratório full-stack de QA com E2E duplo (Cypress + Playwright), testes de contrato, suíte de performance e geração de testes com LLM.**

---

## Problema → Solução → Resultado

**Problema:** A automação de QA é difícil de escalar — testes manuais, ferramentas dispersas e sem pipeline claro para detectar bugs antes do merge.

**Solução:** Um laboratório full-stack onde automação, agentes de IA e CI/CD trabalham juntos. Cada PR dispara um pipeline; cada falha bloqueia o merge.

**Resultado:** Portas de qualidade automatizadas, feedback rápido (~5 min), relatórios unificados e geração de testes assistida por IA. O merge só ocorre quando tudo passa.

---

## Links

| Link | URL |
|------|-----|
| **Repositório** | [github.com/Wesley-Gomes93/qa-lab](https://github.com/Wesley-Gomes93/qa-lab) |
| **Pipeline** | [Actions → pipeline](https://github.com/Wesley-Gomes93/qa-lab/actions) |
| **Demo** | _Adicione sua URL Vercel/deploy quando disponível_ |

**Ver também:** [QA Extended Lab](qa-extended-lab/) (API + A11y) · [Security Lab](https://github.com/Wesley-Gomes93/security-lab) (roadmap)

---

## O que aprendi

- **Stack E2E duplo** — Rodar Cypress e Playwright em paralelo ensinou a desenhar testes que rodam em ambos; specs centralizados para API reduziram duplicação.
- **Testes de contrato** — Validação de schema OpenAPI detecta breaking changes antes do E2E; investimento pequeno com ROI alto.
- **MCP e agentes** — Integração de geração de testes com LLM (Groq, Gemini, OpenAI) mostrou como IA estende fluxos de QA sem substituir pensamento crítico.
- **Design do pipeline** — Lint → Build → Testes (paralelo) → Relatório cria feedback rápido; bloqueio de merge em falha reforça qualidade no gate.
- **Performance como teste** — Métricas TICTAC (load, health, TTI) transformaram performance em requisito verificável.

---

## Decisões de arquitetura

**Por que Cypress + Playwright?** Ambos rodam os mesmos cenários. Mantive os dois para comparar APIs, relatórios e custo de manutenção. Playwright tende a ser ~3x mais rápido no CI; Cypress tem ecossistema maior. Decisão baseada em dados, não em ferramenta.

**Por que agentes de IA?** O Test Writer e o Failure Analyzer estendem QA sem substituir pensamento crítico. Mostram como integração LLM se encaixa em fluxos reais — gerando specs a partir de descrições e sugerindo correções quando testes falham.

**Por que testes de contrato?** Validação OpenAPI detecta mudanças que quebram API antes do E2E. Investimento inicial pequeno evita bugs sutis nos testes de UI.

**Trade-offs:** Não escolhi infra AWS completa (ECS, ALB, CDN) — ROI baixo para portfolio de QA. Também adiei notificações Slack/Teams e dashboards históricos; agregam valor em produção, menos para apresentação de portfolio.

---

## Destaques técnicos

| Área | O que está no projeto |
|------|------------------------|
| **Pipeline CI/CD** | Lint → Build → Testes (Cypress \|\| Playwright) → Relatório Unificado. Merge bloqueado se qualquer etapa falhar. |
| **Stack E2E duplo** | Cypress + Playwright rodam em paralelo. Specs centralizados para testes de API (uma fonte, dois runners). |
| **Testes de contrato** | Validação de spec OpenAPI 3.0. Checagens de schema antes do deploy. |
| **Testes de performance** | Suíte TICTAC: load, health, TTI, latência de path crítico do dashboard. |
| **Agentes de IA** | 3 agentes: menu MCP (execuções interativas), Test Writer (LLM — Groq, Gemini, OpenAI), Failure Analyzer (diagnóstico e sugestões automáticos). |
| **Relatórios** | Mochawesome (Cypress), Playwright HTML, relatório unificado QA Lab. |

---

## Fluxo do pipeline

```
PR aberto / push para main
        ↓
   Lint (ESLint)
        ↓
   Build (Next.js)
        ↓
   ┌────────────┬────────────┐
   │  Cypress   │  Playwright │  ← rodam em paralelo
   │   E2E      │     E2E     │
   └────────────┴────────────┘
        ↓
   Relatório Unificado
        ↓
   ci ✅ (merge permitido)  ou  ci ❌ (merge bloqueado)
```

---

## Arquitetura

| Camada | Tecnologia | Descrição |
|--------|------------|-----------|
| Frontend | Next.js | Playground (auth) + painel Admin (CRUD usuários) |
| Backend | Node.js + Express | API REST: auth, usuários, healthcheck |
| Banco | PostgreSQL | Docker; seed com usuário admin |
| Testes | Cypress + Playwright | Suítes E2E: api, auth, admin, ui, performance |
| CI/CD | GitHub Actions | pipeline.yml, agent.yml |
| Agentes | MCP, Node.js | Menu, Test Writer (LLM), Failure Analyzer |

---

## Início rápido

```bash
# 1. Instalar dependências
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
cd tests && npm install && cd ..

# 2. Subir ambiente (DB, backend, frontend)
npm run dev

# 3. Rodar testes
npm run tests:run
```

---

## Comandos principais

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Sobe DB, backend, frontend (dinâmico: só inicia o que não está rodando) |
| `npm run tests:run` | E2E Cypress |
| `npm run tests:pw` | E2E Playwright |
| `npm run tests:report:unified` | Relatório HTML unificado (Cypress + Playwright) |
| `npm run tests:contract` | Testes de contrato contra spec OpenAPI |
| `npm run agent:run-tests` | Menu interativo para rodar Cypress via MCP |
| `npm run agent:test-writer "descrição"` | **Gera testes com LLM** (Groq, Gemini, OpenAI) |
| `npm run agent:analyze-failures` | Roda testes; em falha, analisa e sugere correções |

---

Veja [docs/COMANDOS.md](docs/COMANDOS.md) para referência completa de todos os comandos.
