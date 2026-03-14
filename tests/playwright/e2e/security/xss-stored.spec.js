/**
 * Security: Stored XSS em /comment + /comments
 * O vulnerable-web armazena e renderiza comentários sem sanitização.
 */
const { test, expect } = require("@playwright/test");

const VULN_BASE = process.env.VULNERABLE_WEB_URL || "http://localhost:3001";

test.describe("Security — Stored XSS", () => {
  test("comentário malicioso é armazenado e refletido sem sanitização", async ({ page }) => {
    const payload = "<img src=x onerror=alert(1)>";
    await page.goto(`${VULN_BASE}/comments`);

    await page.locator('input[name="comment"]').fill(payload);
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/\/comments/);
    const content = await page.content();
    expect(content).toContain(payload);
  });

  test("payload script é persistido e renderizado no HTML", async ({ page }) => {
    const payload = '<svg onload="document.title=\'xss\'">';
    await page.goto(`${VULN_BASE}/comments`);

    await page.locator('input[name="comment"]').fill(payload);
    await page.locator('button[type="submit"]').click();

    await page.reload();
    const content = await page.content();
    expect(content).toContain(payload);
  });
});
