# Cypress vs Playwright – Estratégia e manutenção

## Specs centralizados (sem duplicar)

Testes de **API com request único** ficam em **`tests/shared/specs/api/`** – uma definição, dois runners.

```
tests/shared/specs/api/
├── health.spec.js
├── clean-test-users.spec.js
└── README.md
```

- **Cypress** executa via `api-shared.cy.js`
- **Playwright** executa via `api-shared.spec.js`

**Para adicionar um novo teste de API simples:** crie um arquivo em `shared/specs/api/` seguindo o formato do `README.md`. Os dois runners pegam automaticamente.

**Fluxos complexos** (múltiplos requests, dados dinâmicos) continuam em arquivos separados por framework.

---

## Por que os dois?

O QA Lab mantém **Cypress** e **Playwright** em paralelo por:

1. **Aprendizado** – Comparar ferramentas, APIs e relatórios
2. **Resiliência** – Duas implementações aumentam a confiança nos fluxos críticos
3. **Portfólio** – Mostrar experiência em ambas as ferramentas
4. **Pipeline** – Rodam em paralelo no CI (total ~4min)

## Estrutura atual

| Suíte       | Cypress | Playwright | Observação              |
|-------------|---------|------------|-------------------------|
| api         | ✓       | ✓          | Mesmos cenários         |
| auth        | ✓       | ✓          | Mesmos cenários         |
| admin       | ✓       | ✓          | Mesmos cenários         |
| ui          | ✓       | ✓          | Mesmos cenários         |
| performance | ✓       | ✓          | TICTAC em ambos         |

**Cypress:** `tests/cypress/e2e/**/*.cy.js`  
**Playwright:** `tests/playwright/e2e/**/*.spec.js`

Ambos usam `tests/shared/` (constants, factories) e helpers específicos em `support/`.

---

## Estratégia de manutenção

### Regra 1: Cypress é a fonte primária

- **Novos testes:** Crie primeiro no Cypress (`tests/cypress/e2e/`)
- **Test Writer Agent:** Gera specs Cypress por padrão
- **Failure Analyzer:** Analisa falhas do Cypress

### Regra 2: Playwright espelha o crítico

- **Não duplique tudo** – Priorize: api, auth, admin, performance (TICTAC)
- Ao adicionar um novo cenário importante no Cypress, avalie se vale incluir no Playwright
- Testes muito específicos (ex.: `admin-dashboard-editar-idade-id2`) podem ficar só no Cypress

### Regra 3: Manter paridade nas suítes, não nos arquivos

Não é obrigatório ter o mesmo número de specs em ambos. O importante é:

- **api, auth, admin** – Cobertura equivalente nos fluxos principais
- **ui, performance** – Manter TICTAC e elementos críticos em ambos

### Regra 4: Quando modificar um fluxo

1. Altere no **Cypress** primeiro
2. Se o Playwright tiver o mesmo teste, atualize também
3. Rode `npm run tests:run` e `npm run tests:pw` antes do push

---

## Quando consolidar para um só?

Considere migrar para **apenas Playwright** se:

- A manutenção dupla estiver custando tempo demais
- O foco for velocidade no CI (Playwright tende a ser mais rápido)
- Você quiser simplificar o onboarding de outros devs

**Passos para consolidar:** Migrar specs restantes do Cypress → Playwright, remover Cypress da pipeline, documentar a decisão.

---

## Comandos

```bash
npm run tests:run          # Cypress
npm run tests:pw           # Playwright
npm run tests:report:unified  # Relatório unificado
```

---

## Resumo

| Ação              | Onde fazer primeiro | Replicar no outro?      |
|-------------------|---------------------|-------------------------|
| Novo teste de API | Cypress             | Sim, se fluxo principal |
| Novo teste de auth| Cypress             | Sim                     |
| Novo teste admin  | Cypress             | Avalie (crítico = sim)  |
| Correção de bug   | Onde o teste existe | Se existir nos dois     |
| Test Writer       | Gera Cypress        | Manual se necessário    |
