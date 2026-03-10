# Contract Testing – QA Lab

Valida que as respostas da API respeitam o contrato definido em `api-spec.yaml`.

## Conceito

- **Contrato:** formato esperado da requisição e resposta (campos, tipos).
- **Contract testing:** garantir que a API não quebre o contrato que o consumidor (frontend) espera.

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `docs/api-spec.yaml` | Especificação OpenAPI 3.0 da API |
| `docs/CONTRACT-TESTING.md` | Este documento |
| `tests/contract/validate-against-spec.js` | Script que valida respostas contra o schema |

## Como rodar

1. **Suba a API:**
   ```bash
   npm run db:up
   npm run backend:dev
   ```

2. **Execute o validador:**
   ```bash
   node tests/contract/validate-against-spec.js
   ```

   Ou, com URL customizada:
   ```bash
   API_BASE_URL=http://localhost:4000 node tests/contract/validate-against-spec.js
   ```

## Endpoints validados

- `GET /health` – status, db, uptime, metrics
- `POST /auth/register` – 201 com objeto User (id, name, email, etc.)

## Saída

- ✓ = resposta conforme o contrato
- ✗ = resposta inválida (campo ausente, tipo errado)

Exit code 1 se alguma validação falhar (útil para CI).
