# QA Lab – Pipeline Maintenance Guide

## Where to see the pipeline

- **GitHub Actions:** https://github.com/Wesley-Gomes93/qa-lab/actions
- Each push/PR to `main` triggers the **CI** and **Pipeline** workflows

## Pipeline structure (SDET flow)

```
lint → build → [tests || e2e] → report
```

- **lint** runs first – if it fails, build and tests do not run
- **build** depends on lint – validates compilation before tests
- **tests** (Cypress) and **e2e** (Playwright) run in parallel after build
- **report** consolidates results

| Job | What it does | If it fails |
|-----|--------------|-------------|
| **build** | Frontend build (Next.js) | Check compilation errors |
| **lint** | ESLint on frontend | Fix errors/warnings in code |
| **tests** | PostgreSQL + API + Frontend → **Cypress** | Check Cypress logs |
| **e2e** | PostgreSQL + API + Frontend → **Playwright** | Check Playwright logs |
| **report** | Generates unified report (Cypress + Playwright) | Download artifact `qa-lab-report` |

### Agent Analysis (separate workflow)

The **Agent Analysis** workflow (`agent.yml`) runs the **Failure Analyzer Agent** and can be triggered manually:

1. Go to **Actions** → **Agent Analysis**
2. Click **Run workflow**
3. Optional: provide suite (`all`, `admin`, `auth`, `api`, `ui`, `performance`) or spec path

The agent runs Cypress tests and, on failure, generates structured analysis with fix suggestions.

## How to understand errors

### 1. Open the failed run

1. Open [Actions](https://github.com/Wesley-Gomes93/qa-lab/actions)
2. Click the run with **Failure** status (red)
3. Click the **job** that failed (e.g. `tests`, `e2e`, `lint`)

### 2. Read the log

- Scroll to the end of the failed step's log
- Look for:
  - `Error:` – error message
  - `Process completed with exit code 1` – indicates which step broke
  - Stack traces – show file and line

### 3. Common errors and solutions

| Error | Likely cause | Solution |
|-------|--------------|----------|
| `npm ci` / `package-lock not found` | Lock file missing or in different path | Use `npm install` or adjust cache/paths |
| `Permission denied (publickey)` | SSH key not configured | Use HTTPS or configure SSH |
| `getByText resolved to 2 elements` | Ambiguous locator in Playwright | Use `getByRole`, `getByTestId` or more specific locator |
| `ECONNREFUSED localhost:3000` | Frontend did not start in time | Increase `sleep` before tests |
| `Repository not found` | Private repo without token | Configure `GITHUB_TOKEN` or PAT |
| Lint errors | Unused variables, React rules | Fix code or adjust ESLint rules |

### 4. Download artifacts

When a job fails, you can download:

- **cypress-report** – Cypress HTML report (job `tests`)
- **playwright-report** – Playwright HTML report (job `e2e`)

At the end of the run, click **Artifacts** and download the ZIP.

## How to maintain

### Change the pipeline

- Files: `.github/workflows/ci.yml` and `.github/workflows/pipeline.yml`
- Edit the YAML, commit and push
- New runs will execute automatically

### Add a new job

```yaml
new-job:
  name: new-job
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Run something
      run: echo "Hello"
```

### Run the pipeline manually

The **Pipeline** workflow has `workflow_dispatch` enabled. To run manually:

1. Go to **Actions** → **Pipeline** (left menu)
2. Click **Run workflow** → choose **main** branch
3. Click **Run workflow** (green button)

### Status checks for branch protection

There is a **`ci`** job that only runs when lint, build, tests, and e2e pass. Require **one** check:

1. **Settings** → **Rules** → **Rulesets** → edit the `main` rule
2. Under **Require status checks to pass**, click **+ Add checks**
3. Search for **`ci`** or **`Pipeline / ci`** and add it

The check only appears after the pipeline has run at least once (push, PR, or manual run).

### Debug locally

To simulate the pipeline environment:

```bash
# Start database
npm run db:up

# Start API (other terminal)
npm run backend:dev

# Start frontend (other terminal)
npm run frontend:dev

# Run tests
npm run tests:run      # Cypress
npm run tests:pw       # Playwright
```

## Lint before commit

To check for errors and warnings before committing:

```bash
npm run lint:check
```

The script shows **error** and **warning** count and fails if there are errors (blocking the commit).

## Custom reports

To generate the unified report (Cypress + Playwright) locally:

```bash
# After running tests
npm run tests:run      # or tests:pw for Playwright
npm run tests:report:unified
```

The HTML report is saved to `tests/qa-lab-reports/index.html`.

## Useful links

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Playwright CI](https://playwright.dev/docs/ci)
- [Cypress CI](https://docs.cypress.io/guides/continuous-integration/introduction)
