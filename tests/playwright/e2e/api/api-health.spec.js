const { test, expect } = require("@playwright/test");
const { API_BASE_URL } = require("../../support/helpers");

test.describe("API - Healthcheck", () => {
  test("GET /health responde status ok", async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe("ok");
  });
});
