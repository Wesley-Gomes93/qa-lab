# Comandos e Demonstrações — QA Extended Lab

Guia completo de todos os runs para GIFs, posts e aprendizado.

---

## 1. Todos os comandos (rápido)

| Comando | O que faz | Ideal para GIF/Post |
|---------|-----------|---------------------|
| `npm install` | Instala dependências | Setup inicial |
| `npx playwright install chromium` | Instala browser (1ª vez) | Pré-requisito a11y |
| `npm run test:api` | API tests (6 requests) | Demo Newman básico |
| `npm run test:api:full` | API tests (48 requests) | Demo Newman completo |
| `npm run test:a11y` | Testes de acessibilidade | Demo axe-core |
| `npm run test:all` | API + A11y em sequência | Demo full lab |
| `npm run report:a11y` | Abre relatório HTML a11y | Demo resultado visual |

---

## 2. Sequências sugeridas para gravar

### GIF 1 — Newman rápido (30–60s)
```bash
cd qa-extended-lab
npm run test:api
```
**Mostra:** 6 requests passando, output CLI, relatório salvo.

### GIF 2 — Newman completo (1–2 min)
```bash
npm run test:api:full
```
**Mostra:** 48 requests, pastas (Users, Posts, Comments...), tabela final.

### GIF 3 — Acessibilidade
```bash
npm run test:a11y
npm run report:a11y
```
**Mostra:** Resumo no terminal, relatório HTML abrindo no browser.

### GIF 4 — Pipeline completo
```bash
npm run test:all
```
**Mostra:** Newman → axe em sequência, dois tipos de teste.

### GIF 5 — Só o relatório Newman
```bash
npm run test:api:full
open api-tests/reports/newman-report-*.html   # ou o mais recente
```
**Mostra:** Relatório HTML do Newman (tabela, requests, assertions).

---

## 3. Comandos Newman diretos (sem npm)

Para posts técnicos ou explicar o Newman:

```bash
# Collection básica
npx newman run api-tests/collection/reqres-api.json -e api-tests/collection/env.json

# Collection completa
npx newman run api-tests/collection/jsonplaceholder-completo.json -e api-tests/collection/env.json

# Com relatório HTML customizado
npx newman run api-tests/collection/jsonplaceholder-completo.json \
  -e api-tests/collection/env.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export api-tests/reports/demo.html

# Apenas uma pasta (ex.: Users)
npx newman run api-tests/collection/jsonplaceholder-completo.json \
  -e api-tests/collection/env.json \
  --folder "Users"

# Com variável sobrescrita
npx newman run api-tests/collection/reqres-api.json \
  -e api-tests/collection/env.json \
  --env-var "baseUrl=https://api.example.com"
```

---

## 4. Onde ficam os relatórios

| Tipo | Caminho | Abrir |
|------|---------|-------|
| Newman HTML | `api-tests/reports/newman-report-*.html` | `open api-tests/reports/newman-report-*.html` |
| Newman JSON | `api-tests/reports/newman-report-*.json` | Para CI/parsing |
| A11y HTML | `a11y-tests/reports/a11y-report-latest.html` | `npm run report:a11y` |
| A11y JSON | `a11y-tests/reports/a11y-results-latest.json` | Para CI/parsing |

---

## 5. Ideias de posts / conteúdo

| Tema | Comando + Ângulo |
|------|------------------|
| "Rodando 48 testes de API em 10 segundos" | `test:api:full` + tempo total |
| "Newman: Postman na linha de comando" | `npx newman run ...` + comparação com Postman GUI |
| "Testando acessibilidade com axe-core" | `test:a11y` + print do resumo |
| "Relatório de acessibilidade em português" | `report:a11y` + screenshot do HTML |
| "API + A11y no mesmo pipeline" | `test:all` |
| "Estrutura de uma Postman Collection" | Mostrar JSON da collection |
| "pm.test: validações em JavaScript" | Trecho de test script no Postman |

---

## 6. Newman — Aprofundamento

### 6.1 Conceitos principais

| Conceito | O que é |
|----------|---------|
| **Newman** | CLI que executa Postman Collections sem abrir o Postman |
| **Collection** | Arquivo JSON com requests + scripts de teste |
| **Environment** | Variáveis (baseUrl, token) por ambiente |
| **Reporter** | Formato de saída: cli, htmlextra, json, junit |

### 6.2 Opções úteis do Newman

```bash
npx newman run collection.json [opções]

# Principais opções:
-e, --environment <path>     # Environment file
-g, --globals <path>         # Globals file
--folder <name>              # Roda só uma pasta
--delay-request <ms>         # Delay entre requests
--timeout-request <ms>       # Timeout por request
--reporter-cli-no-summary    # Esconde resumo no final
--reporter-htmlextra-export  # Caminho do HTML
--reporter-htmlextra-dark    # Tema escuro no report
```

### 6.3 Estrutura de um teste Postman (pm.test)

```javascript
// Status
pm.test('Status 200', () => pm.response.to.have.status(200));

// JSON
pm.test('Retorna id', () => pm.expect(pm.response.json()).to.have.property('id'));

// Array
pm.test('É array', () => pm.expect(pm.response.json()).to.be.an('array'));

// Campos obrigatórios
pm.test('User tem email', () => {
  const j = pm.response.json();
  pm.expect(j).to.have.keys(['id', 'name', 'email']);
});

// Response time
pm.test('Rápido', () => pm.expect(pm.response.responseTime).to.be.below(500));

// Headers
pm.test('JSON', () => pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json'));
```

---

## 7. Recursos para aprender mais

### Newman
- [Newman no GitHub](https://github.com/postmanlabs/newman)
- [Newman CLI Options](https://www.npmjs.com/package/newman#newman-run-collection-file-source-options)
- [Postman Scripting (pm.*)](https://learning.postman.com/docs/writing-scripts/test-scripts/) — usado no Newman

### Postman Collection
- [Collection format v2.1](https://schema.getpostman.com/json/collection/v2.1.0/collection.json)
- [Writing tests](https://learning.postman.com/docs/writing-scripts/test-scripts/)
- [Pre-request scripts](https://learning.postman.com/docs/writing-scripts/pre-request-scripts/)

### APIs de teste
- [JSONPlaceholder](https://jsonplaceholder.typicode.com/) — API fake
- [ReqRes](https://reqres.in/) — pode bloquear em CI (Cloudflare)

### axe-core
- [axe-core rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
- [Deque University](https://dequeuniversity.com/) — cursos de a11y

---

## 8. Cheatsheet Newman (uma página)

```
# Rodar
npx newman run collection.json -e env.json

# Com report HTML
npx newman run c.json -e e.json --reporters cli,htmlextra --reporter-htmlextra-export out.html

# Só uma pasta
npx newman run c.json --folder "Users"

# pm.test mais usados
pm.test('OK', () => pm.response.to.have.status(200));
pm.expect(pm.response.json()).to.have.property('id');
pm.expect(pm.response.json()).to.be.an('array');
pm.expect(pm.response.responseTime).to.be.below(500);
```

---

*Use este doc como base para GIFs, posts e estudo. Bom aprendizado.*
