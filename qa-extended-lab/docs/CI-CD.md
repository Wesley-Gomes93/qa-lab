# QA Extended Lab — Integração no CI/CD

Como encaixar os testes de API (Newman) e acessibilidade (axe) no pipeline de CI/CD.

---

## Por que encaixa fácil

Os testes do QA Extended Lab:

- **Newman** → chamam APIs externas (JSONPlaceholder), **não precisam** de banco, backend nem frontend local
- **axe** → acessam URLs públicas (example.com, jsonplaceholder), **não precisam** da aplicação do QA Lab

Ou seja: são **independentes** do stack principal. Rodam em paralelo com Cypress/Playwright sem conflito.

---

## Pré-requisitos no CI

| Recurso | Necessário para | Como obter |
|---------|-----------------|------------|
| Node.js 20 | Newman + axe | `actions/setup-node@v4` |
| npm | Newman + axe | `npm ci` em qa-extended-lab |
| Chromium | axe (Playwright) | `npx playwright install chromium` ou `--with-deps` |
| Rede | Newman (JSONPlaceholder) | Sempre disponível no runner |

**Não precisa:** PostgreSQL, backend, frontend, variáveis secretas.

---

## Onde encaixar no seu pipeline atual

No `pipeline.yml` do QA Lab existe:

```
lint → build → tests (Cypress) + e2e (Playwright) → report → ci
```

Você pode:

1. **Adicionar um job em paralelo** (recomendado)
2. **Criar workflow separado** (mais isolado)

---

## Opção 1 — Job no pipeline existente

Inserir um job `qa-extended-lab` que rode **em paralelo** com `tests` e `e2e`:

```
lint → build
         ├─ tests (Cypress)
         ├─ e2e (Playwright)
         └─ qa-extended-lab  ← NOVO
                   ↓
              report (agregar artefatos)
                   ↓
              ci (exigir todos)
```

**Vantagens:** Um só pipeline, status unificado.  
**Desvantagens:** O job `ci` precisa incluir `qa-extended-lab` em `needs`.

---

## Opção 2 — Workflow separado

Criar `.github/workflows/qa-extended-lab.yml` que dispara nos mesmos eventos (push, PR):

```
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
```

**Vantagens:** Isolado, não altera o pipeline principal, pode rodar em horários diferentes (schedule).  
**Desvantagens:** Mais um workflow para manter, mais um check no PR.

---

## Fluxo típico (GitHub Actions)

```yaml
jobs:
  qa-extended-lab:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: qa-extended-lab/package-lock.json

      - name: Install deps
        run: cd qa-extended-lab && npm ci

      - name: Install Chromium
        run: cd qa-extended-lab && npx playwright install chromium

      - name: Run API tests (Newman)
        run: cd qa-extended-lab && npm run test:api

      - name: Run A11y tests (axe)
        run: cd qa-extended-lab && npm run test:a11y

      - name: Upload Newman report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: newman-report
          path: qa-extended-lab/api-tests/reports/*.html
          if-no-files-found: ignore

      - name: Upload A11y report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: a11y-report
          path: qa-extended-lab/a11y-tests/reports/*.html
          if-no-files-found: ignore
```

---

## Exit codes e falha do CI

| Script | Comportamento | CI falha quando |
|--------|---------------|-----------------|
| Newman | `process.exit(1)` se houver failures | Sim ✓ |
| axe (run-a11y.js) | Hoje sempre `process.exit(0)` | Não ✗ |

Se quiser que **violações de acessibilidade quebrem o CI**, altere em `run-a11y.js`:

```javascript
// Antes:
process.exit(0);

// Depois:
process.exit(hasViolations ? 1 : 0);
```

Isso faz o job falhar quando houver violações.

---

## GitLab CI (exemplo)

```yaml
qa-extended-lab:
  image: node:20
  script:
    - cd qa-extended-lab
    - npm ci
    - npx playwright install chromium
    - npm run test:api
    - npm run test:a11y
  artifacts:
    when: always
    paths:
      - qa-extended-lab/api-tests/reports/
      - qa-extended-lab/a11y-tests/reports/
```

---

## Jenkins (exemplo)

```groovy
stage('QA Extended Lab') {
  dir('qa-extended-lab') {
    sh 'npm ci'
    sh 'npx playwright install chromium'
    sh 'npm run test:api'
    sh 'npm run test:a11y'
  }
  archiveArtifacts artifacts: 'qa-extended-lab/**/reports/*.html', allowEmptyArchive: true
}
```

---

## Resumo rápido

1. **Newman** e **axe** já retornam exit code adequado (Newman sim; axe só com ajuste).
2. Não precisam de infra local: banco, API, frontend.
3. Basta Node, npm e Chromium (para axe).
4. Relatórios HTML vão em `api-tests/reports/` e `a11y-tests/reports/` — faça upload como artefato.
5. Escolha: job no pipeline principal ou workflow separado, conforme preferir.

---

## Próximos passos

- Criar o arquivo `.github/workflows/qa-extended-lab.yml` e integrá-lo no repo.
- Se quiser que violações de a11y quebrem o CI, alterar `process.exit` em `run-a11y.js`.
- Adicionar `qa-extended-lab` ao job `ci` do pipeline, se quiser branch protection baseada nele.
