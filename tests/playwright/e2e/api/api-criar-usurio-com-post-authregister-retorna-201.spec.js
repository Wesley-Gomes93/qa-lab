const { test, expect } = require("@playwright/test");
const { API_BASE_URL, randomEmail, randomName } = require("../../support/helpers");

test.describe("API - Register User", () => {
  test("criar usuário com POST /auth/register retorna 201", async ({ request }) => {
    const userData = {
      name: randomName(),
      email: randomEmail(),
      password: "senha123",
    };

    const response = await request.post(`${API_BASE_URL}/auth/register`, {
      headers: {
        "Content-Type": "application/json",
      },
      data: JSON.stringify(userData),
    });

    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("id");
    expect(responseBody).toHaveProperty("name", userData.name);
    expect(responseBody).toHaveProperty("email", userData.email);
  });
});