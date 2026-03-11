# Test Writer Agent – Generate tests with LLM

Agent that runs the full flow: **read project → understand → suggest test → create test → run → verify if it passed**.

## Prerequisites

1. **OpenAI API Key** (or compatible)
   - Create at https://platform.openai.com/api-keys
   - Set in environment: `OPENAI_API_KEY` or `QA_LAB_LLM_API_KEY`

2. **Backend and frontend running** (to run the generated tests)
   ```bash
   npm run db:up
   npm run backend:dev    # in one terminal
   npm run frontend:dev   # in another
   ```

## Environment variables

| Variable | Description | Free? |
|----------|-------------|-------|
| `GROQ_API_KEY` | Groq (recommended) | ✅ Yes |
| `GEMINI_API_KEY` | Google Gemini | ✅ Yes |
| `OPENAI_API_KEY` | OpenAI | ❌ Paid |
| `QA_LAB_LLM_PROVIDER` | Force provider: `groq`, `gemini`, `openai` | - |
| `QA_LAB_LLM_MODEL` | Model (e.g. `llama-3.3-70b-versatile`, `gemini-1.5-flash`) | - |

**Priority:** Groq → Gemini → OpenAI. Configure one key in `.env`.

Example: create a `.env` file in the project root:

```bash
cp .env.example .env
# Edit .env and add ONE of these keys (Groq and Gemini are free):
# GROQ_API_KEY=gsk_...     → https://console.groq.com/keys
# GEMINI_API_KEY=...       → https://aistudio.google.com/apikey
```

Or export in the terminal before running:
```bash
export OPENAI_API_KEY="sk-..."
npm run agent:test-writer "healthcheck"
```

## Usage

```bash
# From project root
npm run agent:test-writer "API healthcheck"
npm run agent:test-writer "test for POST /auth/register"
npm run agent:test-writer -- --suite api --request "GET /users returns 403 without token"

# Generate Cypress and Playwright at once
npm run agent:test-writer -- --framework both "API healthcheck"

# Generate Playwright only
npm run agent:test-writer -- --framework playwright "API healthcheck"
```

### `--framework` option

| Value | Behavior |
|-------|----------|
| `cypress` | (default) Generates and saves only Cypress |
| `playwright` | Generates and saves only Playwright |
| `both` | Generates **Cypress and Playwright** in parallel and runs both |

## Flow

1. **Read project** – `read_project` reads API routes, existing specs, helpers
2. **Generate** – LLM receives context and request; returns Cypress and/or Playwright code
3. **Create** – `write_test` saves to `tests/cypress/e2e/` or `tests/playwright/e2e/`
4. **Run** – `run_tests` executes each created spec
5. **Verify** – exit code 0 = passed, 1 = failed

If it fails, use `npm run agent:analyze-failures` for fix suggestions.

## Suites

| Suite | Layer | Example |
|-------|-------|---------|
| `api` | API | Healthcheck, CRUD users |
| `auth` | UI | Login, logout, register |
| `admin` | UI | Admin dashboard CRUD |
| `dashboard` | UI | Dashboard navigation, health/metrics/test pages |
| `ui` | UI | Playground, forms |
| `performance` | Performance | TICTAC metrics |

Use `--suite <name>` to target a suite:

```bash
npm run agent:test-writer -- --suite dashboard "navigation to health page"
```

## Example (before → after)

**Input:**
```bash
npm run agent:test-writer "API healthcheck returns 200"
```

**Output:** Creates `tests/cypress/e2e/api/api-healthcheck-returns-200.cy.js` with:

```javascript
describe("API", () => {
  it("GET /health returns 200", () => {
    cy.request({ method: "GET", url: "http://localhost:4000/health" })
      .its("status")
      .should("eq", 200);
  });
});
```

Then runs the test and reports pass/fail.
