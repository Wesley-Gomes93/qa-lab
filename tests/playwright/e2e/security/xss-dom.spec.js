/**
 * Security: DOM-based XSS em /dom-xss.html
 * O fragmento (#) é lido e injetado no innerHTML sem sanitização.
 */
const { test, expect } = require("@playwright/test");

const VULN_BASE = process.env.VULNERABLE_WEB_URL || "http://localhost:3001";

test.describe("Security — DOM-based XSS", () => {
  test("hash é injetado no innerHTML sem escape (DOM XSS)", async ({ page }) => {
    const payload = "<img src=x onerror=alert(1)>";
    await page.goto(`${VULN_BASE}/dom-xss.html#${encodeURIComponent(payload)}`);

    const outputHtml = await page.locator("#output").innerHTML();
    expect(outputHtml).toContain(payload);
  });

  test("conteúdo do hash aparece no DOM sem sanitização", async ({ page }) => {
    const payload = "<b>teste-dom-xss</b>";
    await page.goto(`${VULN_BASE}/dom-xss.html#${encodeURIComponent(payload)}`);

    const content = await page.locator("#output").innerHTML();
    expect(content).toContain(payload);
  });
});
