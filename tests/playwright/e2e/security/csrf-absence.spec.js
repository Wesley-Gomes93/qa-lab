/**
 * Security: Ausência de proteção CSRF em POST /comment
 * O vulnerable-web aceita POST sem token CSRF — permite requisições cross-site.
 */
const { test, expect } = require("@playwright/test");

const VULN_BASE = process.env.VULNERABLE_WEB_URL || "http://localhost:3001";

test.describe("Security — CSRF ausente", () => {
  test("POST /comment aceita requisição sem token CSRF", async ({ request }) => {
    const payload = "Comentário via API sem CSRF token";
    const res = await request.post(`${VULN_BASE}/comment`, {
      form: { comment: payload },
      maxRedirects: 0,
      failOnStatusCode: false,
    });

    // Redireciona 302 para /comments quando sucesso
    expect([302, 200]).toContain(res.status());
  });

  test("comentário é gravado via requisição direta (sem origem no app)", async ({
    request,
    page,
  }) => {
    const payload = "csrf-test-" + Date.now();
    await request.post(`${VULN_BASE}/comment`, {
      form: { comment: payload },
    });

    await page.goto(`${VULN_BASE}/comments`);
    await expect(page.locator("body")).toContainText(payload);
  });
});
