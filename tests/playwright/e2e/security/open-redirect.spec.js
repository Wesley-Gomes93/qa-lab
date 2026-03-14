/**
 * Security: Open Redirect em /redirect?url=
 * O vulnerable-web redireciona para qualquer URL sem validação.
 */
const { test, expect } = require("@playwright/test");

const VULN_BASE = process.env.VULNERABLE_WEB_URL || "http://localhost:3001";

test.describe("Security — Open Redirect", () => {
  test("redireciona para URL externa arbitrária", async ({ page }) => {
    const targetUrl = "https://example.com";
    const res = await page.goto(`${VULN_BASE}/redirect?url=${encodeURIComponent(targetUrl)}`, {
      waitUntil: "commit",
    });

    const finalUrl = page.url();
    expect(finalUrl).toMatch(/example\.com/);
  });

  test("redireciona para URL maliciosa (phishing simulada)", async ({ page }) => {
    const targetUrl = "https://evil-phishing.com";
    await page.goto(`${VULN_BASE}/redirect?url=${encodeURIComponent(targetUrl)}`, {
      waitUntil: "commit",
    });

    // Em ambiente real sem evil-phishing.com, pode dar net::ERR_NAME_NOT_RESOLVED,
    // mas o redirect em si foi executado — verificamos que saiu do domínio original
    const finalUrl = page.url();
    expect(finalUrl).not.toMatch(new RegExp(VULN_BASE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  });
});
