# Primeiro dia no lab

Guia passo a passo para quem acabou de clonar o QA Lab e quer rodar os primeiros testes. **Estimativa:** 15–20 minutos.

---

## Pré-requisitos (antes de começar)

| Item | Como verificar |
|------|----------------|
| **Node.js 20.x** | `node -v` → deve mostrar v20.x |
| **Docker** | `docker --version` — o **Docker Desktop precisa estar aberto e rodando** |
| **Make** | `make -v` (já vem no macOS/Linux) |

---

## Passo 1: Clonar e instalar

```bash
git clone https://github.com/Wesley-Gomes93/qa-lab.git
cd qa-lab

make install
```

O `make install` instala dependências da raiz, frontend, backend, tests, agents e qa-extended-lab. Ao final, deve aparecer: `✓ Instalação concluída`.

---

## Passo 2: Subir o ambiente

```bash
make dev
```

Isso sobe, na ordem:
- **PostgreSQL** (Docker) — banco de dados
- **Backend** — API em http://localhost:4000
- **Frontend** — app em http://localhost:3000

Deixe esse terminal rodando. Em outro terminal, continue o passo 3.

---

## Passo 3: Rodar os testes E2E

No **novo terminal**, ainda na pasta `qa-lab`:

```bash
make qa
```

Esse comando executa:
- Lint
- Contract testing (OpenAPI)
- Cypress E2E
- Playwright E2E
- Relatório unificado

No fim, os relatórios ficam em `tests/qa-lab-reports/`.

---

## Passo 4: Explorar o QA Extended Lab

O QA Extended usa **API pública** (JSONPlaceholder) e **acessibilidade (axe)**. Não precisa do app rodando.

```bash
# Instalar Chromium para testes de acessibilidade (só na primeira vez)
cd qa-extended-lab && npx playwright install chromium && cd ..

# Rodar Newman (API) + axe (a11y)
make qa-extended
```

Relatórios:
- Newman: `qa-extended-lab/api-tests/reports/`
- axe: `qa-extended-lab/a11y-tests/reports/`

---

## Onde ficam os testes e como criar um

### Pastas de teste

| Framework | Pasta | Extensão |
|-----------|-------|----------|
| **Cypress** | `tests/cypress/e2e/` | `*.cy.js` |
| **Playwright** | `tests/playwright/e2e/` | `*.spec.js` |

Estrutura das pastas (organizadas por área):

```
tests/
├── cypress/e2e/
│   ├── api/       → testes de API (health, register, login)
│   ├── auth/      → registro, login, logout
│   ├── admin/     → painel admin (CRUD usuários)
│   ├── dashboard/ → métricas, health, navegação
│   ├── ui/        → elementos da tela
│   └── performance/ → TICTAC (load, health, TTI)
│
└── playwright/e2e/
    ├── api/       → mesmos cenários em .spec.js
    ├── auth/
    ├── admin/
    ...
```

### Como criar um teste

**Opção 1: Com o Test Writer (LLM)** — mais rápido

```bash
# Precisa de API key no agents/.env (GROQ_API_KEY ou GEMINI_API_KEY)
npm run agent:test-writer "GET /health retorna 200 e JSON com status ok"

# Gera em Cypress e Playwright
npm run agent:test-writer -- --framework both "teste de login como admin"
```

O agente lê o projeto, gera o spec, grava o arquivo e roda o teste.

**Opção 2: Manualmente**

1. **Cypress:** crie um arquivo em `tests/cypress/e2e/<área>/nome-do-teste.cy.js`
2. **Playwright:** crie em `tests/playwright/e2e/<área>/nome-do-teste.spec.js`

Exemplo mínimo (Cypress, API):

```javascript
// tests/cypress/e2e/api/meu-teste.cy.js
const { API_BASE } = require('../../support/helpers');

describe('API /health', () => {
  it('retorna 200', () => {
    cy.request('GET', `${API_BASE}/health`).then((res) => {
      expect(res.status).to.equal(200);
    });
  });
});
```

Detalhes: [tests/cypress/e2e/README.md](../tests/cypress/e2e/README.md) e [tests/playwright/README.md](../tests/playwright/README.md).

---

## Resumo do fluxo (copy-paste)

```bash
# 1. Instalar
make install

# 2. Subir ambiente (deixe rodando)
make dev

# 3. Em outro terminal: rodar testes
make qa

# 4. QA Extended (opcional, não precisa do app)
make qa-extended
```

---

## Problemas?

- **Docker não sobe:** Abra o Docker Desktop e aguarde iniciar. Rode `make dev` de novo.
- **Porta em uso:** Veja [AMBIENTE-TROUBLESHOOTING.md](AMBIENTE-TROUBLESHOOTING.md).
- **Backend não conecta no banco:** Crie o `.env`: `cp backend/.env.example backend/.env`.

---

## Próximos passos

- [COMANDOS.md](COMANDOS.md) — lista completa de comandos
- [MAKEFILE-GUIA.md](MAKEFILE-GUIA.md) — entender o Makefile
- [qa-extended-lab/README.md](../qa-extended-lab/README.md) — detalhes do Newman e axe
