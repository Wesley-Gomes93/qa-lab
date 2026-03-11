# API Documentation – QA Lab

REST API for QA Lab: user registration, login, user management (admin), and healthcheck. Backend: **Node.js + Express**, data in **PostgreSQL**.

**OpenAPI contract:** `docs/api-spec.yaml` – used for contract testing. See `docs/CONTRACT-TESTING.md`.

---

## Base URL and environment

| Environment | URL |
|-------------|-----|
| Local | `http://localhost:4000` |
| Production | Define via `PORT` and host (e.g. `https://api.qalab.example.com`) |

**Environment variables:** the backend uses `dotenv` and reads a `.env` file in the `backend/` folder. This file is **not versioned** (in `.gitignore`). To run the API locally, copy `backend/.env.example` to `backend/.env` and adjust if needed. The example contains: `PORT`, `DATABASE_URL`, and optionally `ADMIN_TOKEN` (if not set, the code uses `admin-qa-lab`).

---

## Authentication

- **Public routes:** no token required (`/health`, `POST /auth/register`, `POST /auth/login`).
- **Admin routes:** require header:
  ```http
  Authorization: Bearer <ADMIN_TOKEN>
  ```
  `ADMIN_TOKEN` comes from `process.env.ADMIN_TOKEN` or defaults to `admin-qa-lab`.  
  Admin login returns this same token in `token`.

---

## Endpoints

### 1. Healthcheck (detailed)

Checks if the API is up, database status, and aggregated metrics.

**`GET /health`**

- **Auth:** no.
- **Response:** `200 OK`
  ```json
  {
    "status": "ok",
    "uptime": 123.45,
    "db": "ok",
    "metrics": {
      "apiResponseTimeMs": 12,
      "apiLastRequestMs": 8,
      "authSuccessRate": 0.85,
      "authTotalAttempts": 20,
      "testFailureRate": 0.1,
      "testRunsSampled": 50
    }
  }
  ```
  `db` can be `"ok"` or `"error"`. Metrics come from in-memory logs (API, auth) and the `test_runs` table (last 100 runs for testFailureRate).

---

### 2. User registration

Creates a new user in the database.

**`POST /auth/register`**

- **Auth:** no.
- **Body (JSON):**
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `name` | string | no | Name (default "") |
  | `email` | string | yes | Unique email |
  | `password` | string | yes | Password (plain text) |

- **Responses:**
  - `201 Created` – user created. Body contains: `id`, `name`, `email`, `idade`, `ativo`, `created_at`, `updated_at`.
  - `400 Bad Request` – `email` or `password` missing. E.g. `{ "error": "email and password are required" }`.
  - `409 Conflict` – email already exists. E.g. `{ "error": "User already exists" }`.

**Example:**

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Maria","email":"maria@test.com","password":"senha123"}'
```

---

### 3. Login

Authenticates by email and password; returns token and user data.

**`POST /auth/login`**

- **Auth:** no.
- **Body (JSON):**
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `email` | string | yes | Email |
  | `password` | string | yes | Password |

- **Responses:**
  - `200 OK` – login successful:
    ```json
    {
      "token": "admin-qa-lab",
      "user": { "id": 1, "name": "ADM", "email": "adm@..." },
      "isAdmin": true
    }
    ```
    For admin, `token` is the `ADMIN_TOKEN`; for others, `"fake-token"`. The frontend uses this token in the header for admin calls.
  - `400 Bad Request` – required field missing. E.g. `{ "error": "email and password are required" }`.
  - `401 Unauthorized` – invalid credentials. E.g. `{ "error": "Invalid credentials" }`.

**Example:**

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"maria@test.com","password":"senha123"}'
```

---

### 4. List all users (admin)

Lists registered users. Admin only.

**`GET /users`**

- **Auth:** yes. Header: `Authorization: Bearer <ADMIN_TOKEN>`.
- **Response:**
  - `200 OK` – array of users (without password):
    ```json
    [
      {
        "id": 1,
        "name": "ADM",
        "email": "adm@...",
        "idade": null,
        "ativo": true,
        "created_at": "...",
        "updated_at": "..."
      }
    ]
    ```
  - `403 Forbidden` – token missing or invalid. E.g. `{ "error": "Access denied. Admin only." }`.

---

### 5. Get user by ID

Returns a user by `id`. Public route (no auth); in production it may be restricted.

**`GET /users/:id`**

- **Auth:** no (in current implementation).
- **Params:** `id` – number (user ID).
- **Responses:**
  - `200 OK` – user object (without password): `id`, `name`, `email`, `idade`, `ativo`, `created_at`, `updated_at`.
  - `400 Bad Request` – invalid ID. E.g. `{ "error": "Invalid ID" }`.
  - `404 Not Found` – user not found. E.g. `{ "error": "User not found" }`.

---

### 6. Update user (admin)

Updates name, email, age, and active status. Admin only.

**`PUT /users/:id`**

- **Auth:** yes. Header: `Authorization: Bearer <ADMIN_TOKEN>`.
- **Params:** `id` – number (user ID).
- **Body (JSON):** all optional; only sent fields are updated.
  | Field | Type | Description |
  |-------|------|-------------|
  | `name` | string | Name |
  | `email` | string | Email (unique) |
  | `idade` | number | Age; **must be between 18 and 80** |
  | `ativo` | boolean | User active or inactive |

- **Validation:** if `idade` is provided and outside 18–80, the API responds with `400`: `{ "error": "Age must be between 18 and 80" }`.

- **Responses:**
  - `200 OK` – user updated (full object without password).
  - `400 Bad Request` – invalid ID or age outside 18–80.
  - `403 Forbidden` – not admin.
  - `404 Not Found` – user not found.
  - `409 Conflict` – email already in use. E.g. `{ "error": "Email already in use" }`.

**Example:**

```bash
curl -X PUT http://localhost:4000/users/2 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin-qa-lab" \
  -d '{"idade":25,"ativo":false}'
```

---

### 7. Delete user (admin)

Removes a user. Admin only. **The admin user (fixed seed email) cannot be deleted.**

**`DELETE /users/:id`**

- **Auth:** yes. Header: `Authorization: Bearer <ADMIN_TOKEN>`.
- **Params:** `id` – number (user ID).
- **Responses:**
  - `204 No Content` – user deleted (empty body).
  - `400 Bad Request` – invalid ID.
  - `403 Forbidden` – not admin or attempt to delete admin. E.g. `{ "error": "Admin cannot be deleted" }`.
  - `404 Not Found` – user not found.

---

## Observability and test history API

### GET /api/metrics

Returns in-memory metrics (API response time, auth success rate). Admin only.

- **Auth:** yes. Header: `Authorization: Bearer <ADMIN_TOKEN>`.
- **Response:** `200 OK`
  ```json
  {
    "api": { "avgMs": 15, "lastMs": 12, "sampleCount": 50 },
    "auth": { "rate": 0.9, "success": 18, "failure": 2, "total": 20 }
  }
  ```

### POST /api/clean-test-users

Removes users with email `@teste.com` (keeps admin). Useful to clean up test user accumulation.

- **Auth:** yes. Header: `Authorization: Bearer <ADMIN_TOKEN>`.
- **Response:** `200 OK`
  ```json
  { "ok": true, "deleted": 42 }
  ```

---

### GET /api/test-runs

Lists test run history (paginated). Admin only.

- **Auth:** yes. Header: `Authorization: Bearer <ADMIN_TOKEN>`.
- **Query:** `limit` (default 50, max 100), `offset` (default 0), `status` (optional: `passed` or `failed`).
- **Response:** `200 OK`
  ```json
  {
    "items": [
      {
        "id": 1,
        "suite": "all",
        "spec": null,
        "status": "passed",
        "duration_ms": 45000,
        "total_tests": 18,
        "passed": 18,
        "failed": 0,
        "source": "cypress",
        "reported_at": "2025-03-08T12:00:00.000Z"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
  ```

### POST /api/test-runs

Registers the result of a test run (Cypress, CI, or agent). Admin or `X-Api-Key`.

- **Auth:** `Authorization: Bearer <ADMIN_TOKEN>` or header `X-Api-Key: <QA_LAB_API_KEY>` (if defined in backend).
- **Body (JSON):**
  | Field | Type | Required | Description |
  |-------|------|----------|-------------|
  | `status` | string | yes | `"passed"` or `"failed"` |
  | `suite` | string | no | E.g. `"all"`, `"auth"` |
  | `spec` | string | no | Spec path |
  | `duration_ms` | number | no | Duration in ms |
  | `total_tests` | number | no | Total tests |
  | `passed` | number | no | Passed count |
  | `failed` | number | no | Failed count |
  | `source` | string | no | `"cypress"`, `"ci"`, `"agent"`, etc. (default `"manual"`) |
  | `metadata` | object | no | Free JSON (e.g. `report_url`) |
- **Response:** `201 Created` with the created run object (including `id` and `reported_at`).

---

## Data model (user)

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique ID (serial) |
| `name` | string | Name |
| `email` | string | Unique email |
| `password` | string | Password (never returned in responses) |
| `idade` | number \| null | Age (18–80 on edit) |
| `ativo` | boolean | User active/inactive |
| `created_at` | string | Creation datetime (ISO) |
| `updated_at` | string | Last update datetime |

---

## Status codes used

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |

---

## How it works

1. **Initialization:** the backend creates the `users` table (if missing), creates/updates the admin user (seed), and starts the server on `PORT` (e.g. 4000).
2. **Register/Login:** the frontend (or any client) uses `POST /auth/register` and `POST /auth/login`; login returns `token` and `isAdmin` for access control.
3. **Admin:** the frontend sends `Authorization: Bearer <token>` on calls to `GET /users`, `PUT /users/:id`, and `DELETE /users/:id`. The backend compares the token with `ADMIN_TOKEN` to authorize.
4. **Persistence:** all users (including admin) are stored in PostgreSQL.

To run the API locally: PostgreSQL running (e.g. `docker-compose up -d` in `database/`), copy `backend/.env.example` to `backend/.env`, then `cd backend && npm install && npm run dev`.
