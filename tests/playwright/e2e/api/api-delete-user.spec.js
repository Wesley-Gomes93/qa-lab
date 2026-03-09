const { test, expect } = require("@playwright/test");
const { API_BASE_URL, ADMIN_TOKEN, randomEmail, randomName } = require("../../support/helpers");

test.describe("API - Excluir usuário", () => {
  test("cria usuário, exclui com DELETE /users/:id e valida 404 no GET", async ({ request }) => {
    const user = {
      name: randomName(),
      email: randomEmail(),
      password: "senha123",
    };

    const register = await request.post(`${API_BASE_URL}/auth/register`, { data: user });
    expect(register.status()).toBe(201);
    const registerBody = await register.json();

    const delRes = await request.delete(`${API_BASE_URL}/users/${registerBody.id}`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });
    expect(delRes.status()).toBe(204);

    const getRes = await request.get(`${API_BASE_URL}/users/${registerBody.id}`);
    expect(getRes.status()).toBe(404);
  });
});
