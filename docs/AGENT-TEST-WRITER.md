# Test Writer Agent – Gerar testes com LLM

Agente que executa o fluxo completo: **ler projeto → entender → sugerir teste → criar teste → rodar → verificar se passou**.

## Pré-requisitos

1. **API Key do OpenAI** (ou compatível)
   - Crie em https://platform.openai.com/api-keys
   - Defina no ambiente: `OPENAI_API_KEY` ou `QA_LAB_LLM_API_KEY`

2. **Backend e frontend rodando** (para rodar os testes gerados)
   ```bash
   npm run db:up
   npm run backend:dev    # em um terminal
   npm run frontend:dev   # em outro
   ```

## Variáveis de ambiente

| Variável | Descrição | Gratuito? |
|----------|-----------|-----------|
| `GROQ_API_KEY` | Groq (recomendado) | ✅ Sim |
| `GEMINI_API_KEY` | Google Gemini | ✅ Sim |
| `OPENAI_API_KEY` | OpenAI | ❌ Pago |
| `QA_LAB_LLM_PROVIDER` | Forçar provedor: `groq`, `gemini`, `openai` | - |
| `QA_LAB_LLM_MODEL` | Modelo (ex.: `llama-3.3-70b-versatile`, `gemini-1.5-flash`) | - |

**Prioridade:** Groq → Gemini → OpenAI. Configure uma chave no `.env`.

Exemplo: crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
# Edite .env e adicione UMA destas chaves (Groq e Gemini são gratuitos):
# GROQ_API_KEY=gsk_...     → https://console.groq.com/keys
# GEMINI_API_KEY=...       → https://aistudio.google.com/apikey
```

Ou exporte no terminal antes de rodar:
```bash
export OPENAI_API_KEY="sk-..."
npm run agent:test-writer "healthcheck"
```

## Uso

```bash
# Na raiz do projeto
npm run agent:test-writer "healthcheck da API"
npm run agent:test-writer "teste para POST /auth/register"
npm run agent:test-writer -- --suite api --request "GET /users retorna 403 sem token"
```

## Fluxo

1. **Ler projeto** – `read_project` lê rotas da API, specs existentes, helpers
2. **Gerar** – LLM recebe contexto e pedido do usuário; retorna código Cypress
3. **Criar** – `write_test` grava o spec em `tests/cypress/e2e/{suite}/`
4. **Rodar** – `run_tests` executa o spec criado
5. **Verificar** – exit code 0 = passou, 1 = falhou

Se falhar, use `npm run agent:analyze-failures` para sugestões de correção.
