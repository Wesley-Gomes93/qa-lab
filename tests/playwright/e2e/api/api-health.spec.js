const { test, expect } = require("@playwright/test");
const { API_BASE_URL, buildRandomUser } = require("../../support/helpers");

test.describe("API - health e fluxo básico de usuários", () => {
  test("GET /health responde status ok", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe("ok");
  });

  test("POST /auth/register cria usuário e GET /users/:id encontra persistência", async ({ request }) => {
    const user = buildRandomUser();

    const register = await request.post(`${API_BASE_URL}/auth/register`, {
      data: user,
    });
    expect(register.status()).toBe(201);
    const registerBody = await register.json();

    expect(registerBody).toMatchObject({
      name: user.name,
      email: user.email,
    });
    expect(registerBody.id).toBeTruthy();

    const readUser = await request.get(`${API_BASE_URL}/users/${registerBody.id}`);
    expect(readUser.status()).toBe(200);
    const readUserBody = await readUser.json();

    expect(readUserBody).toMatchObject({
      id: registerBody.id,
      name: user.name,
      email: user.email,
    });
  });
});
