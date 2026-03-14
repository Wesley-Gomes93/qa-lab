/**
 * Security: Reflected XSS em /search?q=
 * O vulnerable-web ecoa o parâmetro sem sanitização — detecta-se payload no HTML.
 */
const { test, expect } = require("@playwright/test");

const VULN_BASE = process.env.VULNERABLE_WEB_URL || "http://localhost:3001";

test.describe("Security — Reflected XSS", () => {
  test("payload refletido em /search sem sanitização é vulnerável", async ({ page }) => {
    const payload = "<script>document.body.innerHTML='XSS'</script>";
    await page.goto(`${VULN_BASE}/search?q=${encodeURIComponent(payload)}`);

    const content = await page.content();
    expect(content).toContain(payload);
  });

  test("payload <img onerror> refletido sem escape indica vuln", async ({ page }) => {
    const payload = "<img src=x onerror=alert(1)>";
    await page.goto(`${VULN_BASE}/search?q=${encodeURIComponent(payload)}`);

    const content = await page.content();
    expect(content).toContain(payload);
  });
});
