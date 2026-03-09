# QA Lab – Relatórios de Testes

## Relatório unificado

O script `generate-qa-report.js` gera um relatório HTML que combina resultados do **Cypress** e **Playwright**.

### Uso local

```bash
# 1. Rode os testes (ambos ou um deles)
npm run tests:run      # Cypress
npm run tests:pw       # Playwright

# 2. Gere o relatório unificado
npm run tests:report:unified
```

O arquivo é salvo em `tests/qa-lab-reports/index.html`.

### Opções

```bash
# Apenas Cypress
cd tests && node scripts/generate-qa-report.js --cypress-only

# Apenas Playwright
cd tests && node scripts/generate-qa-report.js --playwright-only
```

### Na pipeline

O job **report** gera automaticamente o relatório unificado após os testes. O artifact `qa-lab-report` pode ser baixado em cada run.

## Relatórios individuais

| Ferramenta | Onde fica | Como abrir |
|------------|-----------|------------|
| **Cypress** | `tests/cypress/reports/html/` | Abrir `index.html` no navegador |
| **Playwright** | `tests/playwright-report/` | `npm run tests:pw:report` ou abrir `index.html` |

## Pipeline – artifacts

Cada run da pipeline gera artifacts:

- **cypress-report** – relatório mochawesome do Cypress
- **playwright-report** – relatório HTML do Playwright (+ results.json)
- **qa-lab-report** – relatório unificado (resumo)
