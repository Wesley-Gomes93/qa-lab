const { test, expect } = require("@playwright/test");
const { API_BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD } = require("../../support/helpers");

test.describe("API - Autenticação", () => {
  test("Login como admin retorna token", async ({ request }) => {
    const response = await request.post(`${API_BASE_URL}/auth/login`, {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });

    expect(response.status()).toBe(200);

    const responseBody = await response.json();
    expect(responseBody.token).toBeTruthy();
  });
});