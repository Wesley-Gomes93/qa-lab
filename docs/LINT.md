# QA Lab – Configuração de Lint

Configuração de ESLint replicada do padrão qa-mockserver-mcp, com **pastas diferentes e configs diferentes**.

---

## Estrutura

| Pasta        | Config                 | O que linta                          |
|-------------|-------------------------|--------------------------------------|
| **frontend**| `eslint-config-next`    | Next.js, React, TypeScript            |
| **backend** | `eslint.config.js` (raiz) | API Express, Node.js               |
| **tests**   | `eslint.config.js` (raiz) | Cypress, Playwright, Mocha          |
| **agents**  | `eslint.config.js` (raiz) | Agentes MCP, scripts Node.js       |
| **scripts** | `eslint.config.js` (raiz) | Utilitários na raiz                |

---

## Regras base (backend, tests, agents, scripts)

- **Variáveis:** `no-unused-vars`, `no-undef`, `no-duplicate-imports`, `no-var`
- **Código limpo:** `no-debugger`, `no-alert`, `no-unreachable`, `no-empty` (com `allowEmptyCatch`)
- **Segurança:** `no-eval`, `no-implied-eval`
- **Testes (Mocha):** `mocha/no-exclusive-tests`, `mocha/no-identical-title`
- **Formatação:** `max-len` (120 caracteres)

---

## Comandos

```bash
# Lint só frontend (Next.js)
npm run lint:frontend

# Lint backend, tests, agents, scripts (flat config)
npm run lint:backend
npm run lint:tests
npm run lint:agents

# Lint tudo (backend + tests + agents + scripts)
npm run lint

# Lint completo (frontend + resto)
npm run lint:all

# Resumo antes de commit
npm run lint:check
```

---

## Pipeline (GitHub Actions)

Cada pasta tem seu próprio job de lint:

```
lint-frontend → lint-backend → lint-tests → lint-agents
       ↓              ↓             ↓            ↓
                    build → tests || e2e → report
```

Os 4 jobs de lint rodam em paralelo; o build só inicia quando todos passam.
