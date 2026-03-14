# Resumo — Agentes e Fluxo GIF

Documento de referência rápida para agentes, Test Writer e gravação de GIF.

---

## 1. Os 3 agentes

| Agente | Comando | O que faz |
|--------|---------|-----------|
| **Menu** | `npm run agent:run-tests` | Menu interativo: escolhe suíte ou spec, roda Cypress/Playwright |
| **Test Writer** | `npm run agent:test-writer "descrição"` | LLM gera spec → grava arquivo → roda → mostra resultado |
| **Failure Analyzer** | `npm run agent:analyze-failures [suite]` | Roda testes; se falhar, analisa e sugere correção |

---

## 2. Test Writer — Resumo

### Frameworks

| Opção | Comando | Resultado |
|-------|---------|-----------|
| **Cypress** (padrão) | `npm run agent:test-writer "prompt"` | Gera só Cypress |
| **Playwright** | `npm run agent:test-writer -- --framework playwright "prompt"` | Gera só Playwright |
| **Ambos** | `npm run agent:test-writer -- --framework both "prompt"` | Gera Cypress + Playwright, roda os dois |

### O que acontece em cada execução

1. Lê o projeto (rotas, specs existentes, helpers)
2. LLM gera o código do teste
3. Grava no disco (cria ou **sobrescreve** arquivo)
4. Roda o(s) teste(s)
5. Mostra passou ✓ ou falhou ✗

**Arquivo:** o nome vem do prompt. Ex.: `"registro sem email"` → `api-registro-sem-email.cy.js`.  
**Mesmo prompt = mesmo arquivo = sobrescrita.**

### Por que pode falhar?

O LLM **não conhece** exatamente como sua API responde. Exemplos:

- Espera `error: "email and password are required"` → sua API pode ter outra mensagem
- Espera status 401 em GET /users sem token → precisa conferir se é 401
- Usa helpers/constantes que não existem → erro de sintaxe

**Solução:** rodar `npm run agent:analyze-failures` e ajustar o spec conforme a sugestão, ou corrigir manualmente.

### Pré-requisito

`.env` com uma das chaves: `GROQ_API_KEY` ou `GEMINI_API_KEY` (gratuitos).

---

## 3. Gravar GIF — Resumo

### Passo a passo

1. **Ambiente:** `npm run dev` (aguarde “Ambiente pronto”)
2. **App de gravação:** Kap ou Giphy Capture (Mac)
3. **Gravar só o terminal** (área pequena = GIF mais legível)
4. **Comando para gravar:**
   - `npm run agent:test-writer "verificar que registro falha sem email"` — mais impacto
   - `npm run agent:demo` — mais simples, sem digitar
5. **Salvar:** `docs/screenshots/test-writer.gif` ou upload direto no LinkedIn
6. **Duração:** 30–60 segundos

### Prompts para usar (evitar duplicar testes existentes)

| Prompt | Tipo |
|--------|------|
| `"verificar que registro falha sem email"` | Validação API |
| `"GET /users exige token admin"` | Auth |
| `"healthcheck da API"` | Já existe; gera duplicata |

---

## 4. Comandos de referência

| Comando | Uso |
|---------|-----|
| `npm run dev` | Sobe DB + backend + frontend |
| `npm run agent` | Lista ferramentas MCP |
| `npm run agent:run-tests` | Menu interativo |
| `npm run agent:demo` | Roda suite API direto (para GIF) |
| `npm run agent:test-writer "X"` | Gera e roda spec (Cypress) |
| `npm run agent:test-writer -- --framework both "X"` | Cypress + Playwright |
| `npm run agent:analyze-failures api` | Analisa falhas da suite API |
| `cd tests && npx cypress install` | Se "Cypress binary missing" |

---

## 5. Documentos relacionados

| Doc | Conteúdo |
|-----|----------|
| [FLUXO-GIF-POST.md](./FLUXO-GIF-POST.md) | Checklist completo, troubleshooting |
| [POSTS-IDEIAS.md](./POSTS-IDEIAS.md) | Textos prontos para LinkedIn |
| [AGENT-TEST-WRITER.md](./AGENT-TEST-WRITER.md) | Detalhes do Test Writer |
| [COMANDOS.md](./COMANDOS.md) | Todos os comandos do projeto |
