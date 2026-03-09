# QA Lab – Mentalidade SDET, Evolução e Posts

## O que é SDET?

**SDET** (Software Development Engineer in Test) é um engenheiro que combina desenvolvimento e testes. A mentalidade SDET envolve:

| Princípio | O que significa |
|-----------|-----------------|
| **Qualidade como parte do código** | Testes versionados, automatizados, na pipeline |
| **Feedback rápido** | Falhar cedo: lint → build → testes (não esperar tudo rodar se lint quebrou) |
| **Visão de sistema** | Entender o fluxo completo: frontend, API, banco, CI/CD |
| **Prevenção > detecção** | Boas práticas, lint, tipos, revisão antes do merge |
| **Dados e métricas** | Medir evolução: taxa de sucesso, tempo de execução, cobertura |
| **Automação inteligente** | Testes que agregam valor, não apenas "green" |

## Estrutura da Pipeline (fluxo SDET)

```
lint → build → [tests (Cypress) || e2e (Playwright)] → report
```

**Por que nessa ordem?**

1. **Lint primeiro** – Se há erro de código/style, não vale a pena buildar.
2. **Build em seguida** – Se não compila, não vale a pena subir ambiente e rodar testes.
3. **Tests em paralelo** – Cypress e Playwright rodam juntos após o build.
4. **Report por último** – Consolida os resultados dos dois runners.

## Histórico e evolução do projeto

### Como medir

1. **GitHub Actions** – Veja [Actions](https://github.com/Wesley-Gomes93/qa-lab/actions):
   - Taxa de sucesso dos runs (verde vs vermelho)
   - Tempo médio de execução por job
   - Tendência ao longo das semanas

2. **Métricas dos relatórios**:
   - Cypress: `tests/cypress/reports/html/index.html` (passaram / total)
   - Playwright: `tests/playwright-report/results.json` (expected vs unexpected)
   - Relatório unificado: `npm run tests:report:unified`

3. **Commits** – Histórico de correções e novas features.

### Materiais para posts (LinkedIn, portfolio)

| Conteúdo | Ideia |
|----------|--------|
| **Antes (erro)** | Screenshot da pipeline falhando (job em vermelho/laranja), ou log de erro |
| **Depois (acerto)** | Screenshot da pipeline verde, ou relatório com testes passando |
| **Evolução** | Comparar runs: "Semana 1: 70% passando → Semana 2: 95% passando" |
| **Arquitetura** | Diagrama do fluxo lint → build → tests → report |
| **Aprendizado** | "O que mudei: X, Y, Z. Resultado: pipeline estável." |

**Dica:** Salve prints em `docs/evolucao/` (ou pasta similar) com nome tipo `2026-03-pipeline-verde.png` para usar em posts futuros.

## Como evoluir o projeto com mentalidade SDET

### Já implementado ✅

- [x] Pipeline com lint, build, testes (Cypress + Playwright)
- [x] Relatórios unificados
- [x] Documentação da pipeline
- [x] Lint antes do commit (`npm run lint:check`)
- [x] Agent de análise de falhas (Failure Analyzer)

### Próximos passos sugeridos

1. **Cobertura de testes** – Configurar Jest/istanbul ou equivalente para medir % de código exercitado.
2. **Métricas na API** – Endpoint que retorna histórico de runs (ex.: último status, duração média).
3. **Badge no README** – Mostrar status da pipeline (pass/fail) no README.
4. **PR checks** – Garantir que a pipeline rode em PRs e bloqueie merge se falhar.
5. **Slack/Discord** – Notificações quando a pipeline quebrar (opcional).

### Checklist SDET para o QA Lab

- [ ] Todo commit passa pelo lint
- [ ] Build quebra se houver erro de compilação
- [ ] Testes cobrem fluxos críticos (auth, admin, API)
- [ ] Relatórios são gerados e arquivados
- [ ] Pipeline tem ordem lógica (lint → build → test → report)
- [ ] Documentação explica como debugar e manter
