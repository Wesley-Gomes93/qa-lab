# QA Lab – SDET mindset, evolution, and posts

## What is SDET?

**SDET** (Software Development Engineer in Test) is an engineer who combines development and testing. The SDET mindset involves:

| Principle | What it means |
|-----------|---------------|
| **Quality as part of code** | Versioned, automated tests in the pipeline |
| **Fast feedback** | Fail early: lint → build → tests (don't wait for everything if lint broke) |
| **System view** | Understand the full flow: frontend, API, database, CI/CD |
| **Prevention > detection** | Good practices, lint, types, review before merge |
| **Data and metrics** | Measure evolution: success rate, execution time, coverage |
| **Smart automation** | Tests that add value, not just "green" |

## Pipeline structure (SDET flow)

```
lint → build → [tests (Cypress) || e2e (Playwright)] → report
```

**Why this order?**

1. **Lint first** – If there's a code/style error, no point building.
2. **Build next** – If it doesn't compile, no point starting the environment and running tests.
3. **Tests in parallel** – Cypress and Playwright run together after the build.
4. **Report last** – Consolidates results from both runners.

## Project history and evolution

### How to measure

1. **GitHub Actions** – See [Actions](https://github.com/Wesley-Gomes93/qa-lab/actions):
   - Run success rate (green vs red)
   - Average execution time per job
   - Trend over weeks

2. **Report metrics:**
   - Cypress: `tests/cypress/reports/html/index.html` (passed / total)
   - Playwright: `tests/playwright-report/results.json` (expected vs unexpected)
   - Unified report: `npm run tests:report:unified`

3. **Commits** – History of fixes and new features.

### Materials for posts (LinkedIn, portfolio)

| Content | Idea |
|---------|------|
| **Before (error)** | Screenshot of pipeline failing (job in red/orange), or error log |
| **After (success)** | Screenshot of green pipeline, or report with passing tests |
| **Evolution** | Compare runs: "Week 1: 70% passing → Week 2: 95% passing" |
| **Architecture** | Diagram of flow lint → build → tests → report |
| **Learning** | "What I changed: X, Y, Z. Result: stable pipeline." |

**Tip:** Save screenshots in `docs/evolucao/` (or similar folder) with names like `2026-03-pipeline-green.png` for future posts.

## How to evolve the project with SDET mindset

### Already implemented ✅

- [x] Pipeline with lint, build, tests (Cypress + Playwright)
- [x] Unified reports
- [x] Pipeline documentation
- [x] Lint before commit (`npm run lint:check`)
- [x] Failure analysis agent (Failure Analyzer)

### Suggested next steps

1. **Test coverage** – Configure Jest/istanbul or equivalent to measure % of code exercised.
2. **Metrics in API** – Endpoint that returns run history (e.g. last status, average duration).
3. **Badge in README** – Show pipeline status (pass/fail) in the README.
4. **PR checks** – Ensure the pipeline runs on PRs and blocks merge if it fails.
5. **Slack/Discord** – Notifications when the pipeline breaks (optional).

### SDET checklist for QA Lab

- [ ] Every commit goes through lint
- [ ] Build fails if there's a compilation error
- [ ] Tests cover critical flows (auth, admin, API)
- [ ] Reports are generated and archived
- [ ] Pipeline has logical order (lint → build → test → report)
- [ ] Documentation explains how to debug and maintain
