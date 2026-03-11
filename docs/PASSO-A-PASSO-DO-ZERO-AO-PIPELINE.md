# Step by step: from zero to pipeline

This guide takes you **from start to finish**: environment, database, API, frontend, test scenarios, dashboard history, agents, and CI pipeline.

---

## Prerequisites

- **Node.js** 18+ (recommended 20)
- **npm** (comes with Node)
- **Docker** (for PostgreSQL)
- **Git** (to clone and for the pipeline)

Verify:

```bash
node -v   # v18 or v20
npm -v
docker -v
git -v
```

---

## Part 1 – Start the environment (mandatory order)

### 1.1 Clone the project (if you don't have it yet)

```bash
git clone <repo-url> qa-lab
cd qa-lab
```

### 1.2 Database (PostgreSQL)

The project uses PostgreSQL via Docker.

```bash
cd database
docker-compose up -d
cd ..
```

Verify the container is running:

```bash
docker ps
# Should show qa-lab-db on port 5432
```

Default connection: `postgresql://qa:qa123@localhost:5432/qalab`.

### 1.3 Backend (Node API)

```bash
cd backend
cp .env.example .env
# Optional: edit .env to change PORT or DATABASE_URL
npm install
npm run dev
```

Leave this terminal open. The API should start on **port 4000**. Test:

```bash
curl http://localhost:4000/health
# Response: {"status":"ok","uptime":...,"db":"ok","metrics":{...}}
```

Admin credentials (for frontend and dashboard login):  
- Email: `admWesley@test.com.br`  
- Password: `senha12356`

### 1.4 Frontend (Next.js)

In **another terminal**, from the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at **http://127.0.0.1:3000** (or the port Next.js shows).

If the API is on another host/port, create `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Open in the browser: **http://127.0.0.1:3000**.  
You should see the registration/login screen (Playground). Log in with the admin above and enter the **Dashboard** (with tabs: Users, Test history, Metrics, Health).

### 1.5 Tests (Cypress)

In **another terminal**:

```bash
cd tests
npm install
```

For tests to pass, the **API and frontend must be running** (and the database up). Cypress uses `baseUrl: http://localhost:4000` for the API; specs that open the UI (registration, login, dashboard) use the frontend at **http://localhost:3000** (defined in `tests/shared/constants.js` as `FRONTEND_URL`). If the frontend runs on another port, change this in the constants.

---

## Part 2 – Test scenarios and history

### 2.1 View existing scenarios

Specs are in:

- `tests/cypress/e2e/auth/` – registration, login, logout
- `tests/cypress/e2e/api/` – health, user creation
- `tests/cypress/e2e/admin/` – dashboard (editing, filter, deletion, age validation)
- `tests/cypress/e2e/dashboard/` – Health, Metrics, History, navigation
- `tests/cypress/e2e/ui/` – UI elements
- `tests/cypress/e2e/performance/` – TICTAC (load time, health, form, dashboard)

### 2.2 Run all tests (Cypress only)

With **API and frontend running**:

```bash
cd tests
npm test
# or: npx cypress run
```

This runs Cypress and generates a mochawesome report in `tests/cypress/reports/` (HTML + JSON).

### 2.3 Run tests and send result to dashboard (history)

For **test history** to appear in the dashboard, the run must be recorded in the API:

```bash
cd tests
npm run test:report
```

This command:

1. Runs Cypress (`cypress run`).
2. Then runs `node scripts/report-to-api.js`, which reads the mochawesome JSON and sends a `POST` to `http://localhost:4000/api/test-runs`.

**Requirement:** the API must be up and accept the token (by default the script uses `ADMIN_TOKEN=admin-qa-lab`; you can set `ADMIN_TOKEN` or `QA_LAB_API_KEY` in the backend and, in the script, via env `QA_LAB_API_URL` and `ADMIN_TOKEN` or `QA_LAB_API_KEY`).

After running `npm run test:report`, open the frontend, log in as admin, go to the **Test history** tab and check the registered run.

### 2.4 Run a suite or specific spec

Cypress only (without sending to the API):

```bash
cd tests
npx cypress run --spec "cypress/e2e/auth/**/*.cy.js"
npx cypress run --spec "cypress/e2e/admin/admin-dashboard-idade-inativo.cy.js"
```

To send this run to the API, after running you can call the script manually (it uses the **latest** JSON in `cypress/reports/`):

```bash
node scripts/report-to-api.js
```

### 2.5 Create a new scenario (spec)

1. Create a file in `tests/cypress/e2e/`, e.g. in a folder per area (`auth`, `admin`, etc.):
   - Example: `tests/cypress/e2e/auth/my-custom-login.cy.js`
2. Write the spec in Cypress (describe/it, cy.visit, cy.get, etc.). Use the helpers and page objects in `tests/cypress/support/` and `tests/cypress/pages/` if they exist.
3. Run that spec:
   ```bash
   cd tests
   npx cypress run --spec "cypress/e2e/auth/my-custom-login.cy.js"
   ```
4. To appear in history: run `npm run test:report` (all) or run the spec and then `node scripts/report-to-api.js`.

---

## Part 3 – Agents (MCP + interactive menu)

Agents use the MCP server to run tests (and other tools) without memorizing commands.

### 3.1 Install agent dependencies

```bash
cd agents
npm install
```

### 3.2 List MCP tools

```bash
cd agents
npm run agent
# or: node qa-agent.js
```

Expected output: connection to MCP and list of tools (`run_tests`, `get_users_summary`, `read_pr`, `generate_tests`, `analyze_failures`, `create_bug_report`).

### 3.3 Run tests via agent (menu)

With the `tests/` folder installed and API/frontend up:

```bash
cd agents
npm run agent:run-tests
# or: node qa-agent.js run_tests
```

The agent opens a **menu**:

- 1 = all tests  
- 2 = Admin  
- 3 = Auth  
- 4 = API  
- 5 = UI  
- 6 = Performance (TICTAC) or specific file  
- 0 = exit  

Choose an option; Cypress runs and the agent returns the result. The exit code reflects success (0) or failure (1).

### 3.4 Immersion data (optional)

If you want to use your own data (name, email, password) in some registration/login tests, set before running the agent:

```bash
export CYPRESS_REGISTER_NAME="Your Name"
export CYPRESS_REGISTER_EMAIL="your@email.com"
export CYPRESS_REGISTER_PASSWORD="yourpassword"
npm run agent:run-tests
```

(The agent may pass this to the `run_tests` tool; specs are prepared to accept 201 or 409 on re-run.)

### 3.5 Test user cleanup (avoid database accumulation)

The database accumulates users with email `@teste.com`. To clean before tests:

```bash
npm run tests:clean-users      # cleans and shows how many were removed
npm run tests:full             # clean + run all tests + send report
npm run agent:full             # clean + interactive test menu
```

The **Failure Analyzer** (`npm run agent:analyze-failures`) already runs the cleanup automatically.

---

## Part 4 – Dashboard (Users, History, Metrics, Health)

1. Open the frontend: **http://127.0.0.1:3000**.
2. Log in as admin: `admWesley@test.com.br` / `senha12356`.
3. You land on the **Dashboard** with tabs (admin only):
   - **Users** – list, edit, delete, filter.
   - **Test history** – runs registered via `POST /api/test-runs` (e.g. after `npm run test:report` or manual script).
   - **Metrics** – API response time, auth success rate (in-memory data).
   - **Health** – API status, database, aggregated metrics (from `GET /health`).

To populate history: run `npm run test:report` in the `tests` folder with the API up, as in section 2.3.

---

## Part 5 – Pipeline (CI on GitHub)

The **CI** workflow is in `.github/workflows/pipeline.yml`.

### 5.1 What the pipeline does

- **Trigger:** push or pull request to `main` or `master` branches.
- **Steps:**
  1. Repository checkout.
  2. Node 20 and npm cache.
  3. Install backend and tests dependencies (`npm ci`).
  4. Start PostgreSQL (Docker).
  5. Start API in background (with `DATABASE_URL` and `PORT`).
  6. Run Cypress and Playwright (parallel).
  7. Generate unified report; upload as artifact (`qa-lab-report`).

The frontend is built and started for the tests. Cypress specs that need the frontend use `FRONTEND_URL` (localhost:3000 in CI).

### 5.2 How to trigger the pipeline

- **Push** to `main` or `master`: the pipeline runs automatically.
- **Pull request** to `main` or `master`: the pipeline runs on the PR.

On GitHub: **Actions** → **Pipeline** workflow → view the jobs and the **qa-lab-report** artifact (download to see the HTML).

### 5.3 (Optional) Send CI result to API

For CI runs to appear in the dashboard **Test history**:

1. Have the API accessible from GitHub (e.g. deploy on a server or tunnel).
2. Configure repository secrets:
   - `QA_LAB_API_URL` – API base URL (e.g. `https://your-api.example.com`).
   - `QA_LAB_API_KEY` – key configured in the backend (`QA_LAB_API_KEY` in `.env`).
3. In the backend, set in `.env`: `QA_LAB_API_KEY=your-secret-key`.
4. In the workflow, uncomment the **Report test run to API** step and use these secrets in the step's `env`.

While commented, the CI only generates the report and artifact; it does not send anything to the API.

---

## Quick summary – `npm run` from start to finish (from root)

All commands below run from the **project root** (`qa-lab/`).

### First time (setup)

```bash
# 1. Start the database
npm run db:up

# 2. Install backend dependencies and configure .env
cd backend && cp .env.example .env && npm install && cd ..

# 3. Install frontend dependencies
npm run frontend:install

# 4. Install test dependencies
npm run tests:install

# 5. Install agent dependencies
npm run agents:install
```

### Daily use (run everything)

Open **3 terminals** in the project root.

**Terminal 1 – Backend:**

```bash
npm run backend:dev
```

**Terminal 2 – Frontend:**

```bash
npm run frontend:dev
```

**Terminal 3 – Tests and/or agent:**

```bash
# Run tests and send result to dashboard (history)
npm run tests:report

# Or run tests via agent (interactive menu)
npm run agent:run-tests
```

### Full script list (root)

| Command | What it does |
|---------|--------------|
| `npm run db:up` | Starts PostgreSQL (Docker) |
| `npm run db:down` | Stops PostgreSQL |
| `npm run backend:install` | Installs backend deps |
| `npm run backend:dev` | Starts API (port 4000) |
| `npm run frontend:install` | Installs frontend deps |
| `npm run frontend:dev` | Starts frontend (port 3000) |
| `npm run tests:install` | Installs test deps |
| `npm run tests:run` | Runs Cypress (without sending to API) |
| `npm run tests:report` | Runs Cypress and sends result to dashboard |
| `npm run tests:clean-users` | Removes @teste.com users from DB (avoids accumulation) |
| `npm run tests:full` | Clean users + run tests + send report |
| `npm run agents:install` | Installs agent deps |
| `npm run agent` | Lists MCP tools |
| `npm run agent:run-tests` | Interactive menu to run tests |
| `npm run agent:full` | Clean + interactive test menu |
| `npm run agent:analyze-failures` | AI QA: runs tests, analyzes failures and suggests fixes |

### Daily order

| Order | Command | Terminal |
|-------|---------|----------|
| 1 | `npm run db:up` | — (once) |
| 2 | `npm run backend:dev` | Terminal 1 (leave running) |
| 3 | `npm run frontend:dev` | Terminal 2 (leave running) |
| 4 | `npm run tests:report` | Terminal 3 |
| 5 | View history in browser | http://127.0.0.1:3000 → admin login → Test history tab |
| 6 | `npm run agent:run-tests` | Terminal 3 (optional) |

---

## Quick troubleshooting

- **API cannot connect to database:** check if the PostgreSQL container is running (`docker ps`) and if `DATABASE_URL` in `backend/.env` matches `database/docker-compose.yml`.
- **Cypress fails with "baseUrl":** API running at `http://localhost:4000` and `tests/cypress.config.cjs` with `baseUrl` pointing to API (UI specs use FRONTEND_URL for localhost:3000).
- **Empty test history:** run `npm run test:report` in `tests/` with the API up; the script sends to `POST /api/test-runs`. Check if the backend is at `localhost:4000` or adjust `QA_LAB_API_URL` when running the script.
- **Pipeline fails on "Install backend deps":** CI uses `npm ci`; a `package-lock.json` in the backend is required (run `npm install` in the backend and commit the lock file).
- **Pipeline fails on Cypress:** on some runners Chrome may not be installed; the workflow tries `--browser chrome` and falls back to `cypress run` without browser (Electron).
