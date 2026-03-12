# API Tests (Newman)

Tests the [JSONPlaceholder API](https://jsonplaceholder.typicode.com) using Postman collections run via Newman.

## Endpoints covered

| Endpoint | Method | Validates |
|----------|--------|-----------|
| List users | GET | 200, data array |
| Single user | GET | 200, id and email |
| Create user | POST | 201, user created |
| Update user | PUT | 200, data updated |
| Delete user | DELETE | 200 |
| User not found | GET | 404 |

## Run

```bash
npm run test:api        # Collection básica (6 requests)
npm run test:api:full  # Collection completa (48 requests)
```

Reports are saved to `api-tests/reports/` (HTML + JSON).

See `GUIA-POSTMAN-NEWMAN.md` for the full list of tests and how to add more.
