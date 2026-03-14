/**
 * Testes de API com supertest (rodam contra app sem servidor).
 * Requer PostgreSQL rodando (make db-up).
 * Coverage: npm run test:coverage
 */
const { before, describe, it } = require("node:test");
const assert = require("node:assert");
const request = require("supertest");
const { initDb } = require("../db");
const app = require("../server");

describe("API", () => {
  before(async () => {
    await initDb();
  });

  it("GET /health retorna 200 e status ok", async () => {
    const res = await request(app).get("/health");
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, "ok");
    assert.ok(["ok", "error"].includes(res.body.db));
    assert.ok(typeof res.body.uptime === "number");
  });

  it("POST /auth/register sem email retorna 400", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "Test", password: "123" })
      .set("Content-Type", "application/json");
    assert.strictEqual(res.status, 400);
    assert.ok(res.body.error?.includes("obrigatório"));
  });

  it("POST /auth/register com dados válidos retorna 201", async () => {
    const email = `test-${Date.now()}@example.com`;
    const res = await request(app)
      .post("/auth/register")
      .send({ name: "Test User", email, password: "senha123" })
      .set("Content-Type", "application/json");
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.email, email);
    assert.ok(res.body.id);
  });

  it("POST /auth/login sem credenciais retorna 400", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({})
      .set("Content-Type", "application/json");
    assert.strictEqual(res.status, 400);
  });

  it("GET /users sem token retorna 403", async () => {
    const res = await request(app).get("/users");
    assert.strictEqual(res.status, 403);
    assert.ok(res.body.error?.includes("admin"));
  });
});
