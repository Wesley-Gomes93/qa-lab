const { test, expect } = require("@playwright/test");
const { API_BASE_URL, ADMIN_TOKEN } = require("../../support/helpers");

test.describe("API - Limpar usuários de teste", () => {
  test("POST /api/clean-test-users retorna ok com contagem de excluídos", async ({ request }) => {
    const res = await request.post(`${API_BASE_URL}/api/clean-test-users`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(typeof body.deleted).toBe("number");
  });
});
