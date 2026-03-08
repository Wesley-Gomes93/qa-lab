# Teste de performance TICTAC

Este documento explica **o que é o TICTAC**, **por que ter um teste de performance como esse** e **quais benefícios** ele traz para o projeto.

---

## O que é o TICTAC?

**TICTAC** significa **T**ime-based **I**nteraction & **C**ritical path **T**esting for **A**pplication **C**ompliance.

É um teste de performance focado no **caminho crítico** do usuário: em vez de medir apenas “a aplicação está no ar?”, ele mede **quanto tempo** leva para cada etapa importante até o usuário conseguir usar o sistema.

No QA Lab, o TICTAC verifica:

| Métrica | O que mede | Limite padrão |
|--------|------------|----------------|
| **Carregamento da página** | Tempo do fetch até o evento `load` (Playground) | 8 s |
| **Healthcheck da API** | Tempo de resposta do `GET /health` | 2 s |
| **Formulário visível** | Tempo até o formulário de login estar visível (Time to Interactive) | 5 s |
| **Dashboard após login** | Tempo desde o clique em Login até “Bem-vindo de volta” no dashboard | 6 s |

Os limites podem ser ajustados via variáveis de ambiente no Cypress (ex.: `CYPRESS_TICTAC_LOAD_MS`, `CYPRESS_TICTAC_HEALTH_MS`, etc.).

---

## Por que ter um teste de performance como esse?

### 1. **Funcionalidade não basta**

Testes E2E e de API garantem que o fluxo *funciona*: registro, login, edição, etc. Eles não garantem que o fluxo seja **rápido**. Uma tela que demora 15 segundos para abrir pode passar em todos os testes funcionais e ainda assim ser inaceitável para o usuário.

### 2. **Regressão de performance**

Qualquer mudança (novas dependências, mais dados na tela, refactors no front ou no backend) pode deixar a aplicação mais lenta. O TICTAC funciona como **guardrail**: se alguém subir um código que estoura um dos limites, o teste falha e o problema aparece antes de ir para produção.

### 3. **Caminho crítico explícito**

O teste obriga o time a definir “o que é crítico” para o usuário (carregar a home, ver o formulário, entrar no dashboard). Isso vira referência para otimizações e para priorizar onde investir em performance.

### 4. **Integração com o pipeline**

O mesmo comando que roda os testes E2E pode rodar o TICTAC (`npm test` ou a suíte `performance` no agente). Assim, performance vira parte rotineira do QA, não algo “extra” que só alguém lembra de rodar de vez em quando.

---

## Benefícios

- **Detecção cedo:** degradação de tempo (load, API, interatividade) é detectada no CI ou na máquina do dev, não na reclamação do usuário.
- **Métricas objetivas:** números em milissegundos, com limites configuráveis, em vez de “está lento” subjetivo.
- **Foco no que importa:** apenas o caminho crítico (home → login → dashboard), sem dispersar em dezenas de métricas no primeiro momento.
- **Documentação viva:** o próprio spec e este doc explicam o que é “bom” em termos de tempo para o QA Lab.
- **Base para evolução:** depois podem ser adicionadas outras métricas (LCP, TTI via Lighthouse, etc.) mantendo o mesmo conceito TICTAC.

---

## Como rodar

- **Todos os testes (incluindo TICTAC):** na pasta `tests/`, `npm test`.
- **Só TICTAC:**  
  `npx cypress run --spec "cypress/e2e/performance/tictac.cy.js"`
- **Pelo agente:** `npm run agent:run-tests` → opção **Performance – TICTAC (caminho crítico)**.

Para relaxar ou enrijecer os limites (por exemplo, em CI mais lento):

```bash
CYPRESS_TICTAC_LOAD_MS=12000 CYPRESS_TICTAC_DASHBOARD_MS=8000 npx cypress run --spec "cypress/e2e/performance/tictac.cy.js"
```

---

## Resumo

O **TICTAC** é um teste de performance que mede o **tempo** das etapas críticas do QA Lab (load da página, health da API, formulário visível, dashboard após login). Ter um teste assim **evita regressões de performance** e mantém a aplicação dentro de limites aceitáveis, com **benefícios** de detecção cedo, métricas objetivas e integração ao fluxo normal de testes.
