# Passo a passo: do zero ao pipeline

Este guia leva você **do início ao fim**: ambiente, banco, API, frontend, cenários de teste, histórico no dashboard, agentes e pipeline CI.

---

## Pré-requisitos

- **Node.js** 18+ (recomendado 20)
- **npm** (vem com o Node)
- **Docker** (para o PostgreSQL)
- **Git** (para clonar e para o pipeline)

Verifique:

```bash
node -v   # v18 ou v20
npm -v
docker -v
git -v
```

---

## Parte 1 – Subir o ambiente (ordem obrigatória)

### 1.1 Clonar o projeto (se ainda não tiver)

```bash
git clone <url-do-repositorio> qa-lab
cd qa-lab
```

### 1.2 Banco de dados (PostgreSQL)

O projeto usa PostgreSQL via Docker.

```bash
cd database
docker-compose up -d
cd ..
```

Verifique se o container está rodando:

```bash
docker ps
# Deve aparecer qa-lab-db na porta 5432
```

Conexão padrão: `postgresql://qa:qa123@localhost:5432/qalab`.

### 1.3 Backend (API Node)

```bash
cd backend
cp .env.example .env
# Opcional: edite .env para mudar PORT ou DATABASE_URL
npm install
npm run dev
```

Deixe esse terminal aberto. A API deve subir na **porta 4000**. Teste:

```bash
curl http://localhost:4000/health
# Resposta: {"status":"ok","uptime":...,"db":"ok","metrics":{...}}
```

Credenciais do admin (para login no frontend e dashboard):  
- E-mail: `admWesley@test.com.br`  
- Senha: `senha12356`

### 1.4 Frontend (Next.js)

Em **outro terminal**, na raiz do projeto:

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe em **http://127.0.0.1:3000** (ou na porta que o Next mostrar).

Se a API estiver em outro host/porta, crie `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Acesse no navegador: **http://127.0.0.1:3000**.  
Você deve ver a tela de registro/login (Playground). Faça login com o admin acima e entre no **Dashboard** (com abas: Usuários, Histórico de testes, Métricas, Health).

### 1.5 Testes (Cypress)

Em **outro terminal**:

```bash
cd tests
npm install
```

Para os testes passarem, a **API e o frontend precisam estar rodando** (e o banco no ar). O Cypress usa `baseUrl: http://localhost:4000` para API; os specs que abrem a interface (registro, login, dashboard) usam o frontend em **http://localhost:3000** (definido em `tests/cypress/support/helpers.js` como `FRONTEND_URL`). Se o frontend rodar em outra porta, altere esse valor no helper.

---

## Parte 2 – Cenários de teste e histórico

### 2.1 Ver cenários existentes

Os specs ficam em:

- `tests/cypress/e2e/auth/` – registro, login, logout
- `tests/cypress/e2e/api/` – health, criação de usuários
- `tests/cypress/e2e/admin/` – dashboard (edição, filtro, exclusão, validação de idade)
- `tests/cypress/e2e/ui/` – elementos da interface
- `tests/cypress/e2e/performance/` – TICTAC (tempo de carregamento, health, formulário, dashboard)

### 2.2 Rodar todos os testes (só Cypress)

Com **API e frontend rodando**:

```bash
cd tests
npm test
# ou: npx cypress run
```

Isso executa o Cypress e gera relatório mochawesome em `tests/cypress/reports/` (HTML + JSON).

### 2.3 Rodar testes e enviar resultado para o dashboard (histórico)

Para o **histórico de testes** aparecer no dashboard, é preciso gravar o run na API:

```bash
cd tests
npm run test:report
```

Esse comando:

1. Roda o Cypress (`cypress run`).
2. Depois executa `node scripts/report-to-api.js`, que lê o JSON do mochawesome e envia um `POST` para `http://localhost:4000/api/test-runs`.

**Requisito:** a API deve estar no ar e aceitar o token (por padrão o script usa `ADMIN_TOKEN=admin-qa-lab`; você pode definir `ADMIN_TOKEN` ou `QA_LAB_API_KEY` no backend e, no script, via env `QA_LAB_API_URL` e `ADMIN_TOKEN` ou `QA_LAB_API_KEY`).

Depois de rodar `npm run test:report`, abra o frontend, faça login como admin, vá na aba **Histórico de testes** e confira o run registrado.

### 2.4 Rodar uma suíte ou um spec específico

Só Cypress (sem enviar para a API):

```bash
cd tests
npx cypress run --spec "cypress/e2e/auth/**/*.cy.js"
npx cypress run --spec "cypress/e2e/admin/admin-dashboard-idade-inativo.cy.js"
```

Para enviar esse run para a API, depois de rodar você pode chamar o script manualmente (ele usa o **último** JSON em `cypress/reports/`):

```bash
node scripts/report-to-api.js
```

### 2.5 Criar um novo cenário (spec)

1. Crie um arquivo em `tests/cypress/e2e/`, por exemplo em uma pasta por área (`auth`, `admin`, etc.):
   - Exemplo: `tests/cypress/e2e/auth/meu-login-custom.cy.js`
2. Escreva o spec em Cypress (describe/it, cy.visit, cy.get, etc.). Use os helpers e page objects em `tests/cypress/support/` e `tests/cypress/pages/` se existirem.
3. Rode esse spec:
   ```bash
   cd tests
   npx cypress run --spec "cypress/e2e/auth/meu-login-custom.cy.js"
   ```
4. Para aparecer no histórico: rode `npm run test:report` (todos) ou rode o spec e depois `node scripts/report-to-api.js`.

---

## Parte 3 – Agentes (MCP + menu interativo)

Os agentes usam o MCP server para rodar testes (e outras ferramentas) sem decorar comandos.

### 3.1 Instalar dependências dos agentes

```bash
cd agents
npm install
```

### 3.2 Listar ferramentas do MCP

```bash
cd agents
npm run agent
# ou: node qa-agent.js
```

Saída esperada: conexão com o MCP e lista de tools (`run_tests`, `get_users_summary`, `read_pr`, `generate_tests`, `analyze_failures`, `create_bug_report`).

### 3.3 Rodar testes pelo agente (menu)

Com a pasta `tests/` instalada e a API/frontend no ar:

```bash
cd agents
npm run agent:run-tests
# ou: node qa-agent.js run_tests
```

O agente abre um **menu**:

- 1 = todos os testes  
- 2 = Admin  
- 3 = Auth  
- 4 = API  
- 5 = UI  
- 6 = Performance (TICTAC) ou arquivo específico  
- 0 = sair  

Escolha uma opção; o Cypress roda e o agente devolve o resultado. O exit code reflete sucesso (0) ou falha (1).

### 3.4 Dados de imersão (opcional)

Se quiser usar seus próprios dados (nome, e-mail, senha) em alguns testes de registro/login, defina antes de rodar o agente:

```bash
export CYPRESS_REGISTER_NAME="Seu Nome"
export CYPRESS_REGISTER_EMAIL="seu@email.com"
export CYPRESS_REGISTER_PASSWORD="suasenha"
npm run agent:run-tests
```

(O agente pode passar isso para a tool `run_tests`; os specs estão preparados para aceitar 201 ou 409 na reexecução.)

### 3.5 Limpeza de usuários de teste (evitar acúmulo no banco)

O banco acumula usuários com e-mail `@teste.com`. Para limpar antes dos testes:

```bash
npm run tests:clean-users      # limpa e exibe quantos foram removidos
npm run tests:full             # limpa + roda todos os testes + envia relatório
npm run agent:full             # limpa + menu interativo de testes
```

O **Failure Analyzer** (`npm run agent:analyze-failures`) já executa a limpeza automaticamente.

---

## Parte 4 – Dashboard (Usuários, Histórico, Métricas, Health)

1. Abra o frontend: **http://127.0.0.1:3000**.
2. Faça login com o admin: `admWesley@test.com.br` / `senha12356`.
3. Você cai no **Dashboard** com abas (só para admin):
   - **Usuários** – lista, edição, exclusão, filtro.
   - **Histórico de testes** – runs registrados via `POST /api/test-runs` (ex.: após `npm run test:report` ou script manual).
   - **Métricas** – API response time, auth success rate (dados em memória).
   - **Health** – status da API, banco, métricas agregadas (dados de `GET /health`).

Para popular o histórico: rode `npm run test:report` na pasta `tests` com a API no ar, como na seção 2.3.

---

## Parte 5 – Pipeline (CI no GitHub)

O workflow **CI** está em `.github/workflows/ci.yml`.

### 5.1 O que a pipeline faz

- **Trigger:** push ou pull request nas branches `main` ou `master`.
- **Passos:**
  1. Checkout do repositório.
  2. Node 20 e cache npm.
  3. Instala dependências do backend e dos testes (`npm ci`).
  4. Sobe PostgreSQL (Docker).
  5. Sobe a API em background (com `DATABASE_URL` e `PORT`).
  6. Roda o Cypress (`npx cypress run --browser chrome`).
  7. Faz upload do relatório mochawesome como artefato (`cypress-mochawesome-report`).

Não é necessário subir o frontend no CI para os testes atuais (o Cypress está configurado com `baseUrl` na API; specs que precisam de frontend assumem que ele está acessível ou são ajustados para o ambiente de CI).

### 5.2 Como disparar a pipeline

- **Push** na `main` ou `master`: a pipeline roda sozinha.
- **Pull request** para `main` ou `master`: a pipeline roda no PR.

No GitHub: **Actions** → workflow **CI** → ver o job **test** e o artefato **cypress-mochawesome-report** (baixar para ver o HTML do mochawesome).

### 5.3 (Opcional) Enviar resultado do CI para a API

Para que os runs do CI apareçam no **Histórico de testes** do dashboard, é preciso:

1. Ter a API acessível a partir do GitHub (ex.: deploy em um servidor ou tunnel).
2. Configurar secrets no repositório:
   - `QA_LAB_API_URL` – URL base da API (ex.: `https://sua-api.exemplo.com`).
   - `QA_LAB_API_KEY` – chave configurada no backend (`QA_LAB_API_KEY` no `.env`).
3. No backend, definir no `.env`: `QA_LAB_API_KEY=sua-chave-secreta`.
4. No workflow, descomentar o step **Report test run to API** e usar esses secrets no `env` do step.

Enquanto isso estiver comentado, o CI só gera o relatório e o artefato; não envia nada para a API.

---

## Resumo rápido – `npm run` do início ao fim (a partir da raiz)

Todos os comandos abaixo são executados **na raiz do projeto** (`qa-lab/`).

### Primeira vez (setup)

```bash
# 1. Subir o banco
npm run db:up

# 2. Instalar dependências do backend e configurar .env
cd backend && cp .env.example .env && npm install && cd ..

# 3. Instalar dependências do frontend
npm run frontend:install

# 4. Instalar dependências dos testes
npm run tests:install

# 5. Instalar dependências dos agentes
npm run agents:install
```

### Dia a dia (rodar tudo)

Abra **3 terminais** na raiz do projeto.

**Terminal 1 – Backend:**

```bash
npm run backend:dev
```

**Terminal 2 – Frontend:**

```bash
npm run frontend:dev
```

**Terminal 3 – Testes e/ou agente:**

```bash
# Rodar testes e enviar resultado para o dashboard (histórico)
npm run tests:report

# Ou rodar testes pelo agente (menu interativo)
npm run agent:run-tests
```

### Lista completa de scripts (raiz)

| Comando | O que faz |
|---------|-----------|
| `npm run db:up` | Sobe o PostgreSQL (Docker) |
| `npm run db:down` | Para o PostgreSQL |
| `npm run backend:install` | Instala deps do backend |
| `npm run backend:dev` | Sobe a API (porta 4000) |
| `npm run frontend:install` | Instala deps do frontend |
| `npm run frontend:dev` | Sobe o frontend (porta 3000) |
| `npm run tests:install` | Instala deps dos testes |
| `npm run tests:run` | Roda Cypress (sem enviar para API) |
| `npm run tests:report` | Roda Cypress e envia resultado para o dashboard |
| `npm run tests:clean-users` | Remove usuários @teste.com do banco (evita acúmulo) |
| `npm run tests:full` | Limpa usuários + roda testes + envia relatório |
| `npm run agents:install` | Instala deps dos agentes |
| `npm run agent` | Lista tools do MCP |
| `npm run agent:run-tests` | Menu interativo para rodar testes |
| `npm run agent:full` | Limpa + menu interativo de testes |
| `npm run agent:analyze-failures` | AI QA: roda testes, analisa falhas e sugere correções |

### Ordem do dia a dia

| Ordem | Comando | Terminal |
|-------|---------|----------|
| 1 | `npm run db:up` | — (uma vez) |
| 2 | `npm run backend:dev` | Terminal 1 (deixar rodando) |
| 3 | `npm run frontend:dev` | Terminal 2 (deixar rodando) |
| 4 | `npm run tests:report` | Terminal 3 |
| 5 | Ver histórico no navegador | http://127.0.0.1:3000 → login admin → aba Histórico de testes |
| 6 | `npm run agent:run-tests` | Terminal 3 (opcional) |

---

## Troubleshooting rápido

- **API não conecta no banco:** confira se o container PostgreSQL está rodando (`docker ps`) e se `DATABASE_URL` no `backend/.env` está igual ao do `database/docker-compose.yml`.
- **Cypress falha com “baseUrl”:** API no ar em `http://localhost:4000` e `tests/cypress.config.cjs` com `baseUrl: 'http://localhost:4000'`.
- **Histórico de testes vazio:** rode `npm run test:report` em `tests/` com a API no ar; o script envia para `POST /api/test-runs`. Confira se o backend está em `localhost:4000` ou ajuste `QA_LAB_API_URL` ao rodar o script.
- **Pipeline falha no “Install backend deps”:** o CI usa `npm ci`; é necessário ter `package-lock.json` no backend (rode `npm install` no backend e faça commit do lock file).
- **Pipeline falha no Cypress:** em alguns runners o Chrome pode não estar instalado; o workflow tenta `--browser chrome` e faz fallback para `cypress run` sem browser (Electron).

Se quiser, na próxima vez podemos detalhar só a parte de **criação de cenários** (estrutura de um spec, uso de page objects e onde colocar novos arquivos) ou só a **pipeline** (variáveis, secrets e deploy da API).
