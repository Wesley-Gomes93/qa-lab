const { test, expect } = require("@playwright/test");
const { API_BASE_URL, randomEmail, randomName } = require("../../support/helpers");

test.describe("API - Criação e resumo de usuários", () => {
  test("cria 2 usuários, valida resposta e persistência via GET /users/:id", async ({ request }) => {
    const user1 = {
      name: randomName(),
      email: randomEmail(),
      password: "senha123",
    };

    const user2 = {
      name: randomName(),
      email: randomEmail(),
      password: "outrasenha",
    };

    const res1 = await request.post(`${API_BASE_URL}/auth/register`, { data: user1 });
    expect(res1.status()).toBe(201);
    const body1 = await res1.json();
    expect(body1).toMatchObject({ name: user1.name, email: user1.email });
    expect(body1.id).toBeTruthy();

    const get1 = await request.get(`${API_BASE_URL}/users/${body1.id}`);
    expect(get1.status()).toBe(200);
    const getBody1 = await get1.json();
    expect(getBody1).toMatchObject({ id: body1.id, name: user1.name, email: user1.email });

    const res2 = await request.post(`${API_BASE_URL}/auth/register`, { data: user2 });
    expect(res2.status()).toBe(201);
    const body2 = await res2.json();
    expect(body2).toMatchObject({ name: user2.name, email: user2.email });
    expect(body2.id).toBeTruthy();
    expect(body2.id).not.toBe(body1.id);

    const get2 = await request.get(`${API_BASE_URL}/users/${body2.id}`);
    expect(get2.status()).toBe(200);
    const getBody2 = await get2.json();
    expect(getBody2).toMatchObject({ id: body2.id, name: user2.name, email: user2.email });
  });
});
