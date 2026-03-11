# Contract Testing – QA Lab

Validates that API responses comply with the contract defined in `api-spec.yaml`.

## Concept

- **Contract:** expected format of request and response (fields, types).
- **Contract testing:** ensure the API does not break the contract the consumer (frontend) expects.

## Files

| File | Description |
|------|-------------|
| `docs/api-spec.yaml` | OpenAPI 3.0 specification of the API |
| `docs/CONTRACT-TESTING.md` | This document |
| `tests/contract/validate-against-spec.js` | Script that validates responses against the schema |

## How to run

1. **Start the API:**
   ```bash
   npm run db:up
   npm run backend:dev
   ```

2. **Run the validator:**
   ```bash
   node tests/contract/validate-against-spec.js
   ```

   Or, with custom URL:
   ```bash
   API_BASE_URL=http://localhost:4000 node tests/contract/validate-against-spec.js
   ```

## Validated endpoints

- `GET /health` – status, db, uptime, metrics
- `POST /auth/register` – 201 with User object
- `POST /auth/login` – 200 with token, user, isAdmin
- `GET /users/:id` – 200 with User object
- `POST /auth/register` (without email) – 400 with Error object

## Output

- ✓ = response conforms to contract
- ✗ = invalid response (missing field, wrong type)

Exit code 1 if any validation fails (useful for CI).

## How to add more contracts

1. **Define the schema** at the top of `validate-against-spec.js`:

```javascript
const MY_SCHEMA = {
  type: "object",
  required: ["field1", "field2"],
  properties: {
    field1: { type: "string" },
    field2: { type: "integer" },
  },
};
```

2. **Call the API and validate** inside `run()`:

```javascript
const { status, body } = await fetchJson(`${API_BASE}/your-route`, {
  method: "POST",
  body: JSON.stringify({ ... }),
});
const errs = validateObject(body, MY_SCHEMA);
if (status !== 200 || errs.length > 0) {
  failed++;
  results.push({ endpoint: "POST /your-route", ok: false, status, errors: errs });
} else {
  results.push({ endpoint: "POST /your-route", ok: true, status });
}
```

3. **Update** `docs/api-spec.yaml` with the new endpoint (optional, but recommended).
