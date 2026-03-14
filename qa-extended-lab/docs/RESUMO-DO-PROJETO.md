# Resumo do QA Extended Lab

Visão geral de tudo que existe no projeto.

---

## Em uma frase

**Projeto complementar do QA Lab** que roda **Newman** (testes de API) e **axe-core** (testes de acessibilidade) contra APIs e páginas públicas, com relatórios em HTML e JSON.

---

## Parte A — API Tests (Newman)

| Item | Descrição |
|------|-----------|
| **API alvo** | JSONPlaceholder (https://jsonplaceholder.typicode.com) |
| **Collections** | reqres-api.json (6 requests), jsonplaceholder-completo.json (48 requests) |
| **Environment** | env.json (baseUrl) |
| **Runner** | run-newman.js |
| **Relatórios** | HTML (htmlextra) + JSON em api-tests/reports/ |

**Recursos testados:** Users, Posts, Comments, Albums, Photos, Todos  
**Operações:** GET, POST, PUT, PATCH, DELETE  
**Tipos de teste:** Status, estrutura JSON, query params, headers, response time  

---

## Parte B — Acessibilidade (axe-core)

| Item | Descrição |
|------|-----------|
| **Ferramenta** | @axe-core/playwright + Playwright |
| **URLs** | Configuráveis em urls.config.js (padrão: example.com, jsonplaceholder) |
| **Regras** | WCAG 2A, 2AA, best-practice |
| **Runner** | a11y-tests/scripts/run-a11y.js |
| **Relatórios** | HTML + JSON em a11y-tests/reports/ (latest + timestamped) |

**Diferencial:** Relatório em português com guia de soluções para ~40 regras (image-alt, label, color-contrast, etc.)

---

## Comandos

| Comando | O que faz |
|---------|-----------|
| `npm install` | Instala dependências |
| `npx playwright install chromium` | Instala browser (1ª vez, para a11y) |
| `npm run test:api` | 6 testes de API (Users) |
| `npm run test:api:full` | 48 testes de API (todos recursos) |
| `npm run test:a11y` | Testes de acessibilidade |
| `npm run test:all` | API + A11y em sequência |
| `npm run report:a11y` | Abre relatório HTML a11y |

---

## Estrutura de arquivos

```
qa-extended-lab/
├── api-tests/
│   ├── collection/
│   │   ├── reqres-api.json           # 6 requests (Users)
│   │   ├── jsonplaceholder-completo.json  # 48 requests (todos recursos)
│   │   └── env.json
│   ├── reports/                      # newman-report-*.html, *.json
│   ├── run-newman.js
│   ├── GUIA-POSTMAN-NEWMAN.md        # Guia Postman/Newman
│   └── README.md
├── a11y-tests/
│   ├── scripts/
│   │   ├── run-a11y.js               # Runner principal
│   │   └── urls.config.js            # URLs a testar
│   ├── reports/                      # a11y-report-*.html, a11y-results-*.json
│   └── README.md
├── docs/
│   ├── COMANDOS-E-DEMOS.md           # Runs para GIFs, posts, Newman
│   └── RESUMO-DO-PROJETO.md          # Este arquivo
├── package.json
├── README.md
└── .gitignore
```

---

## Dependências

| Pacote | Uso |
|--------|-----|
| newman | Executar Postman collections via CLI |
| newman-reporter-htmlextra | Relatório HTML do Newman |
| @axe-core/playwright | Testes de acessibilidade |
| playwright | Browser para rodar axe |

---

## Documentação

| Arquivo | Conteúdo |
|---------|----------|
| README.md | Quick start, comandos, estrutura |
| api-tests/GUIA-POSTMAN-NEWMAN.md | Collections, scripts, variáveis, exemplos pm.test |
| api-tests/README.md | Como rodar API tests |
| a11y-tests/README.md | Como rodar a11y, configuração de URLs |
| docs/COMANDOS-E-DEMOS.md | Todos os runs, ideias de GIF/post, Newman aprofundado |
| docs/CI-CD.md | Integração no CI/CD (GitHub Actions, GitLab, Jenkins) |

---

## Relatórios

| Tipo | Onde | Formato |
|------|------|---------|
| Newman | api-tests/reports/ | HTML (htmlextra), JSON |
| axe | a11y-tests/reports/ | HTML (português), JSON |

**Latest (sempre o mais recente):** a11y-report-latest.html, a11y-results-latest.json

---

## Projetos relacionados

- **QA Lab** — Projeto principal (E2E, CI/CD, agents)
- **Security Lab** — Roadmap (bug bounty, pentest)

---

## Links rápidos

- [JSONPlaceholder](https://jsonplaceholder.typicode.com)
- [Newman](https://github.com/postmanlabs/newman)
- [axe-core rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
