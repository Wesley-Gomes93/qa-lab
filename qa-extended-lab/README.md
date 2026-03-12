# QA Extended Lab

> API Testing (Newman) + Accessibility (axe-core) — extension of [QA Lab](https://github.com/Wesley-Gomes93/qa-lab).

A complementary project that runs **Newman** against public APIs and **axe-core** against web pages, with HTML and JSON reports.

---

## Quick start

```bash
npm install
npx playwright install chromium   # required for a11y tests (first run only)
npm run test:all
```

---

## What it tests

### Part A – API (Newman)
- Target: [JSONPlaceholder API](https://jsonplaceholder.typicode.com)
- Endpoints: List users, Single user, Create, Update, Delete, User not found
- Reports: `api-tests/reports/newman-report-*.html`

### Part B – Accessibility (axe-core)
- Target: Configurable URLs (default: example.com, jsonplaceholder.typicode.com)
- Rules: WCAG 2A, 2AA, best-practice
- Reports: `a11y-tests/reports/a11y-report-*.html`

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run test:api` | Newman — API tests (6 requests) |
| `npm run test:api:full` | Newman — API tests (48 requests, all resources) |
| `npm run test:a11y` | axe-core — accessibility tests |
| `npm run test:all` | Run API + A11y |
| `npm run report:a11y` | Open a11y HTML report |

See [docs/COMANDOS-E-DEMOS.md](docs/COMANDOS-E-DEMOS.md) for GIF/post ideas and Newman deep dive.

---

## Structure

```
qa-extended-lab/
├── api-tests/
│   ├── collection/       # Postman collection + env
│   ├── reports/          # Newman output
│   └── run-newman.js
├── a11y-tests/
│   ├── scripts/
│   │   ├── run-a11y.js
│   │   └── urls.config.js
│   └── reports/          # axe output
├── package.json
└── README.md
```

---

## Related projects

- **[QA Lab](https://github.com/Wesley-Gomes93/qa-lab)** — Main full-stack lab (E2E, CI/CD, agents)
- **[Security Lab](https://github.com/Wesley-Gomes93/security-lab)** — Bug bounty, pentest, hacking (roadmap)
