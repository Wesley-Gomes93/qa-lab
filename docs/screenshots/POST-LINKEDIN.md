# Guia: Screenshot e legenda para post no LinkedIn

## Qual screenshot usar (em ordem de prioridade)

### 1. Pipeline (GitHub Actions) — **maior impacto**
- **Onde:** [Actions do repositório](https://github.com/Wesley-Gomes93/qa-lab/actions)
- **Como capturar:** Abra um workflow run que passou (verde). Capture a tela mostrando os jobs: Lint, Build, Cypress, Playwright, CI — todos com ✓ verde.
- **Por quê:** Mostra pipeline funcionando, qualidade automatizada, profissionalismo.

### 2. Relatório unificado
- **Onde:** Após rodar `npm run tests:report:unified`, abra `tests/qa-lab-reports/` (arquivo HTML).
- **Como capturar:** Abra o report no navegador, tire screenshot da visão geral (Cypress + Playwright juntos).
- **Por quê:** Mostra resultado tangível dos testes, relatório integrado.

### 3. Test Writer (GIF que você já tem)
- **Arquivo:** `test-writer-gif-1.gif`
- **Por quê:** Mostra IA gerando testes — diferencial. GIFs funcionam no LinkedIn e chamam atenção.

---

## Legenda para a imagem (para usar no post)

**Em português:**
> QA Lab — Pipeline CI/CD, E2E (Cypress + Playwright), testes de contrato e agentes de IA.

**Em inglês:**
> QA Lab — CI/CD pipeline, E2E (Cypress + Playwright), contract testing & AI agents.

---

## Se não tiver screenshot pronta

Use o GIF existente (`test-writer-gif-1.gif`) — já mostra uma funcionalidade forte (geração de testes com IA). Ou poste sem imagem; o texto forte ainda vale.
