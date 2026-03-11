# Cenários – Dashboard (Health, Métricas, Histórico, Navegação)

Bateria de testes E2E para as páginas do dashboard admin. Implementados em Cypress e Playwright.

---

## Matriz de cenários

| Spec | Cenário | Cypress | Playwright |
|------|---------|---------|------------|
| **dashboard-health** | Exibe título e página de health | ✓ | ✓ |
| **dashboard-health** | Exibe cards API e Database com status | ✓ | ✓ |
| **dashboard-health** | Exibe seção JSON bruto | ✓ | ✓ |
| **dashboard-metricas** | Exibe título e página de métricas | ✓ | ✓ |
| **dashboard-metricas** | Exibe card API Response Time | ✓ | ✓ |
| **dashboard-metricas** | Exibe cards Auth Rate e Test Failure Rate | ✓ | ✓ |
| **dashboard-testes** | Exibe título e página de histórico | ✓ | ✓ |
| **dashboard-testes** | Exibe tabela ou mensagem vazia | ✓ | ✓ |
| **dashboard-navigation** | Navega Health → Métricas → Testes → Usuários | ✓ | ✓ |

---

## Arquivos

```
tests/
├── cypress/e2e/dashboard/
│   ├── dashboard-health.cy.js
│   ├── dashboard-metricas.cy.js
│   ├── dashboard-testes.cy.js
│   └── dashboard-navigation.cy.js
└── playwright/e2e/dashboard/
    ├── dashboard-health.spec.js
    ├── dashboard-metricas.spec.js
    ├── dashboard-testes.spec.js
    └── dashboard-navigation.spec.js
```

---

## data-testid adicionados

| Elemento | data-testid |
|----------|-------------|
| Página Health | `page-health` |
| Card API (Health) | `health-card-api` |
| Card DB (Health) | `health-card-db` |
| Página Métricas | `page-metricas` |
| Card API (Métricas) | `metricas-card-api` |
| Página Testes | `page-testes` |
| Tabela test runs | `table-test-runs` |
| Lista vazia | `test-runs-empty` |
| Link Usuários | `nav-usuarios` |
| Link Testes | `nav-testes` |
| Link Métricas | `nav-metricas` |
| Link Health | `nav-health` |

---

## Como rodar

```bash
# Todos os testes (mesmos cenários nos dois frameworks):
npm run test:cy          # Cypress (~24 specs)
npm run test:pw         # Playwright (~26 testes)
npm run test:all        # Os dois em sequência

# Só dashboard:
npm run test:pw -- dashboard/
npm run test:cy -- --spec "cypress/e2e/dashboard/*.cy.js"   # de dentro de tests/
```
