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
- `POST /auth/register` – 201 com objeto User
- `POST /auth/login` – 200 com token, user, isAdmin
- `GET /users/:id` – 200 com objeto User
- `POST /auth/register` (sem email) – 400 com objeto Error

## Saída

- ✓ = resposta conforme o contrato
- ✗ = resposta inválida (campo ausente, tipo errado)

Exit code 1 se alguma validação falhar (útil para CI).

## Como adicionar mais contratos

1. **Defina o schema** no início do `validate-against-spec.js`:

```javascript
const MEU_SCHEMA = {
  type: "object",
  required: ["campo1", "campo2"],
  properties: {
    campo1: { type: "string" },
    campo2: { type: "integer" },
  },
};
```

2. **Chame a API e valide** dentro do `run()`:

```javascript
const { status, body } = await fetchJson(`${API_BASE}/sua-rota`, {
  method: "POST",
  body: JSON.stringify({ ... }),
});
const errs = validateObject(body, MEU_SCHEMA);
if (status !== 200 || errs.length > 0) {
  failed++;
  results.push({ endpoint: "POST /sua-rota", ok: false, status, errors: errs });
} else {
  results.push({ endpoint: "POST /sua-rota", ok: true, status });
}
```

3. **Atualize** `docs/api-spec.yaml` com o novo endpoint (opcional, mas recomendado).
