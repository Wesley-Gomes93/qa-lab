# QA SDET – Guia Prático

Este documento reúne conceitos e práticas para evoluir como QA SDET: contract testing, Page Objects, relatórios, agentes e como consolidar unit + load no portfólio.

---

## 1. Contract Testing

### O que é?

**Contract testing** valida o **contrato** entre dois serviços: o que o **consumidor** espera e o que o **provedor** entrega. Em vez de subir tudo junto e testar E2E, você garante que a API respeita o contrato definido pelo frontend (ou outro cliente).

### Por que usar?

| Cenário | Sem contract | Com contract |
|---------|--------------|---------------|
| API muda campo `email` → `userEmail` | E2E quebra só quando rodar | Falha na pipeline antes do deploy |
| Frontend e backend em times diferentes | Integração quebrada no fim | Cada um testa seu lado contra o contrato |
| Deploy independente | Medo de quebrar | Confiança para deploy contínuo |

### Ferramentas

- **Pact** – contrato definido pelo consumidor, provedor verifica
- **Spring Cloud Contract** – mais usado em Java
- **OpenAPI/Swagger** – contrato como especificação; pode validar respostas contra o schema

### No QA Lab (próximo passo)

1. Definir contrato da API (ex.: OpenAPI em `docs/api-spec.yaml`)
2. Testes de API validam que a resposta respeita o schema
3. Ou: adicionar Pact entre frontend (consumidor) e backend (provedor)

### Exemplo simplificado (validação de schema)

```javascript
// validar que GET /users/:id retorna { id, name, email, ... }
const schema = {
  type: 'object',
  required: ['id', 'name', 'email'],
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' }
  }
};
// assert response matches schema
```

---

## 2. Page Objects, Helpers e APIs

### Page Object

Objeto que **encapsula** uma tela: elementos (selectors) e ações (métodos). O teste usa o Page Object em vez de `cy.get(...)` ou `page.locator(...)` direto.

**Vantagens:**
- Um lugar só para mudar se o layout mudar
- Testes mais legíveis
- Reuso entre specs

**Estrutura no QA Lab:**
- `cypress/pages/PlaygroundPage.js` – Playground (registro, login)
- `cypress/pages/DashboardPage.js` – se existir, dashboard admin
- `playwright/pages/` – equivalentes para Playwright

### Helpers

Funções utilitárias **agnósticas** de ferramenta quando possível:
- `randomEmail()`, `randomName()`, `buildRandomUser()`
- `ensureAdminTestUsers()` – garante dados no banco
- Constantes: `ADMIN_EMAIL`, `API_BASE_URL`

**Onde ficar:** `tests/shared/` para funções puras; cada framework tem helpers específicos (Cypress usa `cy`, Playwright usa `page`).

### Factories

Funções que **criam dados** para testes:

```javascript
function buildRandomUser(overrides = {}) {
  return {
    name: randomName(),
    email: randomEmail(),
    password: 'senha123',
    ...overrides
  };
}
```

Uso: `buildRandomUser({ name: 'João' })` – só sobrescreve o que importa.

### Evitar duplicação Cypress vs Playwright

| O que compartilhar | Onde |
|--------------------|------|
| Constantes, URLs, credenciais | `tests/shared/constants.js` |
| Factories (randomEmail, buildRandomUser) | `tests/shared/factories.js` |
| Selectors como strings | `tests/shared/selectors.js` |
| Lógica de negócio (ex.: validação de idade 18–80) | `tests/shared/validators.js` |

| O que NÃO compartilhar | Motivo |
|------------------------|--------|
| Comandos `cy.get()` vs `page.locator()` | APIs diferentes |
| Page Objects com métodos de interação | Cypress síncrono, Playwright async |
| Helpers que usam `cy` ou `page` | Framework-specific |

**Solução:** Page Objects **por framework**, mas que **importam** constants, factories e selectors de `shared/`.

---

## 3. Relatórios e Métricas

### O que o QA Lab já tem

| Tipo | Ferramenta | Onde ver |
|------|------------|----------|
| Cypress | Mochawesome | `tests/cypress/reports/html/` |
| Playwright | HTML + JSON | `tests/playwright-report/` |
| Unificado | `generate-qa-report.js` | `tests/qa-lab-reports/index.html` |
| CI | Artifacts | GitHub Actions → baixar ZIP |

### Métricas úteis para SDET

| Métrica | Como obter |
|---------|------------|
| Taxa de sucesso | passed / total |
| Tempo de execução | duration do report |
| Cobertura (unit) | Jest/Vitest + istanbul |
| Flaky rate | Histórico de runs (falhou uma vez, passou depois) |
| Tempo por suite | Mochawesome/Playwright por spec |

### Melhorias possíveis

1. **Badge no README** – status da pipeline (verde/vermelho)
2. **Endpoint `/health`** – já expõe métricas básicas
3. **Dashboard de histórico** – ver evolução ao longo do tempo (roadmap)
4. **Trends** – gráfico de pass/fail por dia/semana

---

## 4. Agente na Pipeline

### Ideia

Colocar um agente no fluxo que:
1. Recebe os resultados dos testes (Cypress/Playwright)
2. Analisa quais cenários existem
3. Sugere novos testes com base em gaps
4. (Futuro) Escreve os specs automaticamente

### Fluxo sugerido

```
Pipeline roda testes
    ↓
Job "report" gera JSON com resultados
    ↓
Job "agent-suggest" (novo)
    - Lê lista de specs
    - Lê código da API e frontend
    - Chama agente (LLM ou regras) para sugerir novos cenários
    - Gera arquivo docs/SUGESTOES-TESTES.md ou comment no PR
```

### Implementação incremental

1. **Fase 1:** Agente lê `tests/cypress/e2e/**/*.cy.js` e `tests/playwright/e2e/**/*.spec.js`, lista cenários existentes.
2. **Fase 2:** Agente compara com endpoints da API (`docs/API.md` ou OpenAPI) e sugere "falta testar PATCH /users/:id".
3. **Fase 3:** Agente gera esqueleto de spec (template) que o dev preenche ou revisa.
4. **Fase 4:** Integrar com Failure Analyzer (já existe) para, em falhas, sugerir testes que evitariam o bug.

### Onde rodar

- **Opção A:** Job separado na pipeline, após `report` – gera sugestões e faz upload como artifact
- **Opção B:** Workflow manual (como o Agent Analysis atual) – "Sugerir novos testes"
- **Opção C:** Pre-commit ou hook – analisa specs modificados e sugere complementos

---

## 5. Evitar Duplicação Cypress + Playwright

### Problema

Mesmos cenários em `.cy.js` e `.spec.js` – manutenção dobrada.

### Estratégias

#### A) Manter ambos, compartilhar lógica (recomendado)

- `tests/shared/` – constants, factories, selectors
- Cypress e Playwright importam de `shared/`
- Cada um mantém seus specs (a API do `cy` e do `page` é diferente)
- **Vantagem:** menos duplicação de dados e regras; specs continuam legíveis.

#### B) Um runner principal, outro para smoke

- Cypress = suite completa
- Playwright = 5–10 specs de smoke (login, health, 1 fluxo admin)
- **Vantagem:** menos specs para manter.
- **Desvantagem:** menos cobertura em um dos runners.

#### C) Testes como dados (avanzado)

- Definir cenários em JSON/YAML
- Um script gera `.cy.js` e `.spec.js` a partir dos dados
- **Vantagem:** única fonte de verdade.
- **Desvantagem:** complexidade maior; menos flexibilidade por spec.

### Recomendação

Implementar **A)** – `tests/shared/` com constants, factories e selectors; Cypress e Playwright refatoram para usar. Isso já reduz duplicação sem mudar a estrutura de specs.

---

## 6. Consolidar Unit + Load no Portfólio e LinkedIn

### No README

- **Seção "Testes"** com pirâmide:
  - Unit (Jest) – componentes, utils
  - API – endpoints
  - E2E – Cypress + Playwright
  - Performance – TICTAC + k6

- **Badge:** `![Pipeline](https://github.com/.../actions/workflows/pipeline.yml/badge.svg)`

- **Métricas:** Se tiver cobertura, mostrar %; se tiver k6, mostrar "Load test: X req/s".

### No LinkedIn

1. **Post "Evolução":** "Adicionei unit tests + k6 no QA Lab. Pirâmide completa."
2. **Post "Arquitetura":** Diagrama da pipeline (lint → build → tests → report) + menção a shared code.
3. **Post "Resultado":** Antes: testes manuais. Depois: pipeline automatizada, X specs, Y% cobertura.

### O que mostrar

| Item | Impacto |
|------|---------|
| Pipeline verde + branch protection | Alto |
| Test strategy (pirâmide, riscos) | Alto |
| Relatórios (screenshot do HTML) | Médio |
| Shared code (constants, factories) | Médio |
| k6 + TICTAC | Alto |
| Agente na pipeline | Diferencial |

---

## Resumo

| Tópico | Ação |
|--------|------|
| **Contract** | Estudar Pact ou validação OpenAPI; começar com schema básico |
| **Page Objects** | Manter por framework; importar shared (constants, factories, selectors) |
| **Helpers** | Colocar funções puras em `shared/` |
| **Relatórios** | Usar o que já existe; adicionar badge e métricas no README |
| **Agente** | Fase 1: listar specs; Fase 2: sugerir gaps; Fase 3: gerar templates |
| **Duplicação** | Criar `tests/shared/` e refatorar ambos os runners |
| **Portfólio** | Badge, pirâmide no README, posts de evolução no LinkedIn |
