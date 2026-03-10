#!/usr/bin/env node
/**
 * Contract testing: valida respostas da API contra o schema OpenAPI.
 * Requer: API rodando (npm run backend:dev) e fetch disponível.
 *
 * Uso: node tests/contract/validate-against-spec.js
 * Ou:  API_BASE_URL=http://localhost:4000 node tests/contract/validate-against-spec.js
 */

const API_BASE = process.env.API_BASE_URL || process.env.CYPRESS_BASE_URL || "http://localhost:4000";

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON from ${url}: ${text.slice(0, 200)}`);
  }
  return { status: res.status, body };
}

function validateObject(obj, schema, path = "") {
  const errors = [];
  if (schema.required) {
    for (const key of schema.required) {
      if (!(key in obj)) {
        errors.push(`${path}Missing required field: ${key}`);
      }
    }
  }
  if (schema.properties) {
    for (const [key, prop] of Object.entries(schema.properties)) {
      const val = obj[key];
      const subPath = path ? `${path}.${key}` : key;
      if (val === undefined) continue;
      if (val === null) continue; // null é aceito quando não há dados
      if (prop.type === "string" && typeof val !== "string") {
        errors.push(`${subPath} expected string, got ${typeof val}`);
      }
      if (prop.type === "number" && (typeof val !== "number" || Number.isNaN(val))) {
        errors.push(`${subPath} expected number, got ${typeof val}`);
      }
      if (prop.type === "integer" && (typeof val !== "number" || !Number.isInteger(val))) {
        errors.push(`${subPath} expected integer, got ${typeof val}`);
      }
      if (prop.type === "boolean" && typeof val !== "boolean") {
        errors.push(`${subPath} expected boolean, got ${typeof val}`);
      }
      if (prop.properties && typeof val === "object" && val !== null) {
        errors.push(...validateObject(val, prop, subPath));
      }
    }
  }
  return errors;
}

const HEALTH_SCHEMA = {
  type: "object",
  required: ["status", "db"],
  properties: {
    status: { type: "string" },
    db: { type: "string", enum: ["ok", "error"] },
    uptime: { type: "number" },
    metrics: {
      type: "object",
      properties: {
        apiResponseTimeMs: { type: "number" },
        authSuccessRate: { type: "number" },
      },
    },
  },
};

const USER_SCHEMA = {
  type: "object",
  required: ["id", "name", "email"],
  properties: {
    id: { type: "integer" },
    name: { type: "string" },
    email: { type: "string" },
    idade: { type: ["integer", "null"] },
    ativo: { type: "boolean" },
    created_at: { type: "string" },
    updated_at: { type: "string" },
  },
};

const LOGIN_RESPONSE_SCHEMA = {
  type: "object",
  required: ["token", "user"],
  properties: {
    token: { type: "string" },
    user: {
      type: "object",
      required: ["id", "name", "email"],
      properties: {
        id: { type: "integer" },
        name: { type: "string" },
        email: { type: "string" },
      },
    },
    isAdmin: { type: "boolean" },
  },
};

const ERROR_SCHEMA = {
  type: "object",
  required: ["error"],
  properties: { error: { type: "string" } },
};

async function run() {
  const results = [];
  let failed = 0;

  // 1. GET /health
  try {
    const { status, body } = await fetchJson(`${API_BASE}/health`);
    const errs = validateObject(body, HEALTH_SCHEMA);
    if (status !== 200 || errs.length > 0) {
      failed++;
      results.push({ endpoint: "GET /health", ok: false, status, errors: errs, body });
    } else {
      results.push({ endpoint: "GET /health", ok: true, status });
    }
  } catch (e) {
    failed++;
    results.push({ endpoint: "GET /health", ok: false, error: e.message });
  }

  // 2. POST /auth/register -> 201 + User schema
  try {
    const email = `contract_${Date.now()}@teste.com`;
    const { status, body } = await fetchJson(`${API_BASE}/auth/register`, {
      method: "POST",
      body: JSON.stringify({ name: "ContractTest", email, password: "senha123" }),
    });
    const errs = validateObject(body, USER_SCHEMA);
    if (status !== 201 || errs.length > 0) {
      failed++;
      results.push({ endpoint: "POST /auth/register", ok: false, status, errors: errs, body });
    } else {
      results.push({ endpoint: "POST /auth/register", ok: true, status });
    }
  } catch (e) {
    failed++;
    results.push({ endpoint: "POST /auth/register", ok: false, error: e.message });
  }

  // 3. POST /auth/login -> 200 + token, user
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admWesley@test.com.br";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "senha12356";
  try {
    const { status, body } = await fetchJson(`${API_BASE}/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    });
    const errs = validateObject(body, LOGIN_RESPONSE_SCHEMA);
    if (status !== 200 || errs.length > 0) {
      failed++;
      results.push({ endpoint: "POST /auth/login", ok: false, status, errors: errs });
    } else {
      results.push({ endpoint: "POST /auth/login", ok: true, status });
    }
  } catch (e) {
    failed++;
    results.push({ endpoint: "POST /auth/login", ok: false, error: e.message });
  }

  // 4. GET /users/:id -> 200 + User (usa id do registro anterior)
  try {
    const email = `contract_get_${Date.now()}@teste.com`;
    const reg = await fetchJson(`${API_BASE}/auth/register`, {
      method: "POST",
      body: JSON.stringify({ name: "GetTest", email, password: "senha123" }),
    });
    const userId = reg.status === 201 ? reg.body.id : null;
    if (userId) {
      const { status, body } = await fetchJson(`${API_BASE}/users/${userId}`);
      const errs = validateObject(body, USER_SCHEMA);
      if (status !== 200 || errs.length > 0) {
        failed++;
        results.push({ endpoint: "GET /users/:id", ok: false, status, errors: errs });
      } else {
        results.push({ endpoint: "GET /users/:id", ok: true, status });
      }
    } else {
      results.push({ endpoint: "GET /users/:id", ok: false, error: "Register failed, skipping" });
      failed++;
    }
  } catch (e) {
    failed++;
    results.push({ endpoint: "GET /users/:id", ok: false, error: e.message });
  }

  // 5. POST /auth/register sem email -> 400 + Error
  try {
    const { status, body } = await fetchJson(`${API_BASE}/auth/register`, {
      method: "POST",
      body: JSON.stringify({ password: "senha123" }),
    });
    const errs = validateObject(body, ERROR_SCHEMA);
    if (status !== 400 || errs.length > 0) {
      failed++;
      results.push({ endpoint: "POST /auth/register (400)", ok: false, status, errors: errs });
    } else {
      results.push({ endpoint: "POST /auth/register (400)", ok: true, status });
    }
  } catch (e) {
    failed++;
    results.push({ endpoint: "POST /auth/register (400)", ok: false, error: e.message });
  }

  // Output
  console.log("\nContract testing – QA Lab API\n");
  for (const r of results) {
    const icon = r.ok ? "✓" : "✗";
    console.log(`${icon} ${r.endpoint}`);
    if (!r.ok && (r.errors?.length || r.error)) {
      if (r.error) console.log(`   Error: ${r.error}`);
      if (r.errors?.length) r.errors.forEach((e) => console.log(`   - ${e}`));
    }
  }
  console.log("");
  if (failed > 0) {
    process.exit(1);
  }
}

run();
