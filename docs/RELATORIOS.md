# QA Lab – Test Reports

## Unified report

The `generate-qa-report.js` script generates an HTML report that combines **Cypress** and **Playwright** results.

### Local usage

```bash
# 1. Run tests (both or one of them)
npm run tests:run      # Cypress
npm run tests:pw       # Playwright

# 2. Generate the unified report
npm run tests:report:unified
```

The file is saved to `tests/qa-lab-reports/index.html`.

### Options

```bash
# Cypress only
cd tests && node scripts/generate-qa-report.js --cypress-only

# Playwright only
cd tests && node scripts/generate-qa-report.js --playwright-only
```

### In the pipeline

The **report** job automatically generates the unified report after tests. The `qa-lab-report` artifact can be downloaded from each run.

## Execution report (comparison)

The `execution-report.js` script generates a full report with:

- **Results** from Cypress and Playwright (passed, failed, skipped, duration)
- **Performance comparison** (e.g. "Playwright executed 3.6x faster")
- **Suites** executed (api, auth, admin, dashboard, ui, performance)
- **Slowest file** per framework
- **Layer** (API / UI)
- **Environment** (CI Pipeline / Local)
- **History** of the last 5 runs

```bash
# Run Cypress + Playwright and generate report
npm run tests:execution

# Generate report from existing reports
npm run tests:report:execution
```

Output: console + `tests/qa-lab-reports/execution-report.txt`

## Individual reports

| Tool | Location | How to open |
|------|----------|-------------|
| **Cypress** | `tests/cypress/reports/html/` | Open `index.html` in browser |
| **Playwright** | `tests/playwright-report/` | `npm run tests:pw:report` or open `index.html` |

## Pipeline – artifacts

Each pipeline run generates artifacts:

- **cypress-report** – Cypress mochawesome report
- **playwright-report** – Playwright HTML report (+ results.json)
- **qa-lab-report** – unified report (summary) + execution-report.txt (comparison)
