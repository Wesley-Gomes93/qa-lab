# Testes E2E/API com Playwright

Suite Playwright com paridade da cobertura Cypress (admin, auth, api, ui e performance).

## Estrutura

```bash
playwright/
├── README.md
├── support/
│   └── helpers.js
└── e2e/
    ├── admin/
    │   ├── admin-dashboard-editar-idade-id1.spec.js
    │   ├── admin-dashboard-editar-idade-id2.spec.js
    │   ├── admin-dashboard-editar-idade-id3.spec.js
    │   ├── admin-dashboard-validacao-idade.spec.js
    │   ├── admin-dashboard-status-inativo.spec.js
    │   ├── admin-dashboard-filtro-usuario-inativo.spec.js
    │   ├── admin-dashboard-excluir-inativo.spec.js
    │   └── admin-dashboard-idade-inativo.spec.js
    ├── api/
    │   ├── api-health.spec.js
    │   ├── api-users-creation.spec.js
    │   ├── api-clean-test-users.spec.js
    │   └── api-delete-user.spec.js
    ├── auth/
    │   ├── login-admin.spec.js
    │   ├── logout.spec.js
    │   ├── register-and-login.spec.js
    │   ├── register-title.spec.js
    │   ├── register-fill-combinations.spec.js
    │   └── register-full-flow.spec.js
    ├── performance/
    │   └── tictac.spec.js
    └── ui/
        └── ui-elements.spec.js
```

## Configuração padrão

- Frontend: `http://localhost:3000` (`FRONTEND_URL`)
- API: `http://localhost:4000` (`API_BASE_URL`)
- Admin token: `admin-qa-lab` (`ADMIN_TOKEN`)

## Rodar

```bash
cd tests

# Executa tudo
npm run pw:test

# Executa por área
npx playwright test playwright/e2e/admin
npx playwright test playwright/e2e/auth
npx playwright test playwright/e2e/api
npx playwright test playwright/e2e/performance/tictac.spec.js

# Modo interativo
npm run pw:ui

# Abrir relatório HTML após a execução
npm run pw:report
```

## Observação

A configuração default usa `workers=1` para reduzir flakes em cenários que compartilham estado de banco.
