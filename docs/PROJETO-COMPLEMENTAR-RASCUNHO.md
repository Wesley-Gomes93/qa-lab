# Projeto Complementar – Rascunho Visual

> **QA Extended Lab** – API Testing (Newman) + Acessibilidade (axe-core)  
> Rascunho para planejamento antes de codar.

---

## 1. Visão geral em uma imagem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     QA EXTENDED LAB (Projeto Complementar)                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────┐         ┌─────────────────────┐                   │
│   │   PARTE A: API      │         │   PARTE B: A11y     │                   │
│   │   Newman + Postman  │         │   axe-core          │                   │
│   └──────────┬──────────┘         └──────────┬──────────┘                   │
│              │                               │                              │
│              ▼                               ▼                              │
│   ┌─────────────────────┐         ┌─────────────────────┐                   │
│   │  API pública         │         │  Páginas web         │                   │
│   │  (ex: ReqRes,        │         │  (ex: docs da API,   │                   │
│   │   JSONPlaceholder)   │         │   ou site público)   │                   │
│   └─────────────────────┘         └─────────────────────┘                   │
│              │                               │                              │
│              ▼                               ▼                              │
│   ┌─────────────────────┐         ┌─────────────────────┐                   │
│   │  Relatório Newman    │         │  Relatório axe      │                   │
│   │  (JSON, HTML)       │         │  (violations, HTML) │                   │
│   └─────────────────────┘         └─────────────────────┘                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura de pastas (como vai ficar)

```
qa-extended-lab/                    ← repo separado (ou pasta qa-lab/extended/)
│
├── api-tests/                     ← PARTE A
│   ├── collection/                # Coleções Postman
│   │   ├── reqres-api.json        # Collection exportada do Postman
│   │   └── env.json               # Variáveis de ambiente (base URL, etc.)
│   ├── reports/                   # Saída do Newman
│   │   ├── newman-report.html
│   │   └── newman-report.json
│   └── README.md                  # Como rodar, endpoints cobertos
│
├── a11y-tests/                    ← PARTE B
│   ├── scripts/
│   │   ├── run-a11y.js            # Roda axe em URLs configuradas
│   │   └── urls.config.js         # Lista de URLs para testar
│   ├── reports/                   # Saída do axe
│   │   ├── a11y-report.html
│   │   └── a11y-results.json
│   └── README.md                  # Como rodar, regras usadas
│
├── package.json                   # Scripts: test:api, test:a11y, test:all
├── README.md                      # Overview do projeto, links para QA Lab
└── .github/workflows/             # (opcional) CI rodando ambos
    └── tests.yml
```

---

## 3. Fluxo de execução

```
                    npm run test:all
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
        npm run test:api         npm run test:a11y
                │                       │
                ▼                       ▼
        ┌───────────────┐       ┌───────────────┐
        │   Newman      │       │   axe-core    │
        │   lê collection│       │   visita URLs │
        │   envia HTTP   │       │   analisa DOM │
        │   valida resp. │       │   gera report │
        └───────┬───────┘       └───────┬───────┘
                │                       │
                ▼                       ▼
        api-tests/reports/      a11y-tests/reports/
        newman-*.html           a11y-report.html
```

---

## 4. O que cada parte testa (conteúdo)

### Parte A – API (Newman)

| Endpoint / Ação      | Método | O que valida                        |
|----------------------|--------|-------------------------------------|
| List users           | GET    | Status 200, schema do body          |
| Single user          | GET    | Status 200, campos corretos         |
| Create user          | POST   | Status 201, user criado             |
| Update user          | PUT    | Status 200, dados atualizados      |
| Delete user          | DELETE | Status 204                          |
| User not found       | GET    | Status 404                          |

*Exemplo com ReqRes (https://reqres.in). Pode trocar por JSONPlaceholder.*

---

### Parte B – A11y (axe-core)

| Página / URL         | O que o axe verifica                    |
|----------------------|-----------------------------------------|
| Home da API (ex: reqres.in) | Contraste, labels, headings, ARIA   |
| Página de docs       | Navegação, foco, links                  |
| (opcional) QA Lab frontend | Reuso do seu próprio projeto     |

*Regras comuns: wcag2a, wcag2aa, best-practice (configuráveis)*

---

## 5. Diagrama de dependências

```
                    qa-extended-lab
                            │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
   newman (CLI)      @axe-core/cli        playwright ou
   newman-reporter-  ou axe-core +         puppeteer (para
   html              playwright/puppeteer   rodar axe em páginas)
```

*Newman = apenas Node. axe-core pode usar playwright ou puppeteer para abrir páginas e injetar o axe.*

---

## 6. Relatórios (como vão aparecer)

### Newman
- HTML: tabela de requests, status, tempo
- JSON: para CI, badges

### axe
- HTML: violations por página, severidade (critical, serious, moderate), sugestões de correção
- JSON: para CI, histórico

---

## 7. Decisões pendentes (para você definir)

| Decisão              | Opções                                      | Sugestão                 |
|----------------------|---------------------------------------------|--------------------------|
| Onde fica o projeto  | Repo separado / pasta dentro do qa-lab     | Repo separado            |
| API alvo             | ReqRes, JSONPlaceholder, outra              | ReqRes (tem UI também)   |
| Páginas para a11y    | Docs da API, ReqRes UI, QA Lab, combinado  | ReqRes UI + 1–2 outras   |
| CI (GitHub Actions)  | Sim / Não                                   | Sim, rodar em PR/push    |
| Nome do repo         | qa-extended-lab, qa-api-a11y-lab, etc.     | qa-extended-lab          |

---

## 8. Timeline sugerida (rascunho)

```
Semana 1
├── Dia 1–2: Setup do repo, Newman + collection ReqRes
├── Dia 3: Rodar Newman local, gerar report HTML
└── Dia 4: Documentar API tests no README

Semana 2
├── Dia 1–2: Setup axe-core, script para URLs
├── Dia 3: Rodar a11y, gerar report
├── Dia 4: Unificar scripts (test:api, test:a11y, test:all)
└── Dia 5: CI no GitHub, README principal, link no QA Lab
```

---

## 9. Resumo em uma frase

> **Um projeto que roda Newman contra uma API pública e axe-core contra páginas web, com relatórios HTML e scripts `npm run test:api` e `npm run test:a11y`, linkado ao QA Lab como projeto complementar.**

---

*Rascunho pronto para planejar. Quer ajustar algo antes de começar a implementar?*
