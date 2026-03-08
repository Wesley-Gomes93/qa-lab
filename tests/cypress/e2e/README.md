# Testes E2E (Cypress)

Os specs estão organizados por área. O padrão `cypress/e2e/**/*.cy.js` inclui todos os arquivos em subpastas.

## Estrutura

```
e2e/
├── README.md
├── admin/                    # Painel admin (dashboard)
│   ├── admin-dashboard-editar-idade-id1.cy.js
│   ├── admin-dashboard-editar-idade-id2.cy.js
│   ├── admin-dashboard-editar-idade-id3.cy.js
│   ├── admin-dashboard-validacao-idade.cy.js
│   ├── admin-dashboard-status-inativo.cy.js
│   ├── admin-dashboard-filtro-usuario-inativo.cy.js
│   ├── admin-dashboard-excluir-inativo.cy.js
│   └── admin-dashboard-idade-inativo.cy.js   # Suite completa (um arquivo com todo o fluxo)
├── api/                      # Chamadas diretas à API (baseUrl: backend)
│   ├── api-health.cy.js
│   └── api-users-creation.cy.js
├── auth/                     # Registro, login, logout
│   ├── login-admin.cy.js
│   ├── logout.cy.js
│   ├── register-and-login.cy.js
│   ├── register-title.cy.js
│   ├── register-fill-combinations.cy.js
│   └── register-full-flow.cy.js
└── ui/                       # Elementos e layout da tela inicial
    └── ui-elements.cy.js
```

## Uso

- **Um cenário por arquivo (admin):** cada spec em `admin/` cobre um único fluxo (ex.: editar idade id 1, validar idade, etc.) para facilitar execução isolada e relatórios.
- **Suite completa:** `admin/admin-dashboard-idade-inativo.cy.js` executa todos os cenários de admin em sequência (idade 1–3, validação, inativo, filtro, exclusão).
- **Helpers:** constantes e funções compartilhadas ficam em `support/helpers.js` (ex.: `ADMIN_EMAIL`, `randomAgeBetween18And80`, `ensureAdminTestUsers`).

## Rodar

```bash
# Todos os testes
cd tests && npx cypress run

# Só admin (todos os arquivos da pasta)
npx cypress run --spec "cypress/e2e/admin/**/*.cy.js"

# Só a suite completa do admin
npx cypress run --spec cypress/e2e/admin/admin-dashboard-idade-inativo.cy.js

# Só auth
npx cypress run --spec "cypress/e2e/auth/**/*.cy.js"

# Só API
npx cypress run --spec "cypress/e2e/api/**/*.cy.js"
```
