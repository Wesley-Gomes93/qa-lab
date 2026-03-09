# Testes E2E/API com Playwright

Suite inicial em paralelo ao Cypress para evoluir a robustez do QA Lab.

## Estrutura

```bash
playwright/
├── README.md
├── support/
│   └── helpers.js
└── e2e/
    ├── api/
    │   └── api-health.spec.js
    ├── auth/
    │   └── register-and-login.spec.js
    └── ui/
        └── ui-elements.spec.js
```

## Configuração padrão

- Frontend: `http://localhost:3000` (`FRONTEND_URL`)
- API: `http://localhost:4000` (`API_BASE_URL`)

## Rodar

```bash
cd tests

# Executa tudo
npm run pw:test

# Modo interativo
npm run pw:ui

# Abrir relatório HTML após a execução
npm run pw:report
```

## Dica de evolução

Portar gradualmente os cenários críticos do Cypress para Playwright (auth, admin e performance) e manter as duas suites em paralelo até consolidar estabilidade no CI.
