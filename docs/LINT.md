# QA Lab – Lint configuration

ESLint configuration replicated from the qa-mockserver-mcp pattern, with **different folders and different configs**.

---

## Structure

| Folder | Config | What it lints |
|--------|--------|---------------|
| **frontend** | `eslint-config-next` | Next.js, React, TypeScript |
| **backend** | `eslint.config.mjs` (root) | Express API, Node.js |
| **tests** | `eslint.config.mjs` (root) | Cypress, Playwright, Mocha |
| **agents** | `eslint.config.mjs` (root) | MCP agents, Node.js scripts |
| **scripts** | `eslint.config.mjs` (root) | Root utilities |

---

## Base rules (backend, tests, agents, scripts)

- **Variables:** `no-unused-vars`, `no-undef`, `no-duplicate-imports`, `no-var`
- **Clean code:** `no-debugger`, `no-alert`, `no-unreachable`, `no-empty` (with `allowEmptyCatch`)
- **Security:** `no-eval`, `no-implied-eval`
- **Tests (Mocha):** `mocha/no-exclusive-tests`, `mocha/no-identical-title`
- **Formatting:** `max-len` (120 characters)

---

## Commands

```bash
# Lint frontend only (Next.js)
npm run lint:frontend

# Lint backend, tests, agents, scripts (flat config)
npm run lint:backend
npm run lint:tests
npm run lint:agents

# Lint all (backend + tests + agents + scripts)
npm run lint

# Full lint (frontend + rest)
npm run lint:all

# Summary before commit
npm run lint:check
```

---

## Pipeline (GitHub Actions)

Each folder has its own lint job:

```
lint-frontend → lint-backend → lint-tests → lint-agents
       ↓              ↓             ↓            ↓
                    build → tests || e2e → report
```

The 4 lint jobs run in parallel; the build only starts when all pass.
