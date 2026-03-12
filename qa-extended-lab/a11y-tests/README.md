# Accessibility Tests (axe-core)

Runs axe-core against configured URLs to detect WCAG violations.

## Configuration

Edit `scripts/urls.config.js` to add or remove URLs.

## Run

```bash
npm run test:a11y
```

Reports are saved to `a11y-tests/reports/` (HTML + JSON).

## Standards

- wcag2a, wcag2aa, best-practice
