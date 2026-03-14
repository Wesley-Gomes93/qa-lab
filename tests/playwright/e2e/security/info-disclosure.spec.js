/**
 * Security: Information Disclosure em /debug
 * O vulnerable-web expõe dados sensíveis (admin_password, env, versão Node).
 */
const { test, expect } = require("@playwright/test");

const VULN_BASE = process.env.VULNERABLE_WEB_URL || "http://localhost:3001";

test.describe("Security — Information Disclosure", () => {
  test("/debug expõe admin_password", async ({ request }) => {
    const res = await request.get(`${VULN_BASE}/debug`);
    expect(res.ok()).toBe(true);

    const body = await res.json();
    expect(body).toHaveProperty("admin_password");
    expect(body.admin_password).toBe("admin123");
  });

  test("/debug expõe variáveis de ambiente", async ({ request }) => {
    const res = await request.get(`${VULN_BASE}/debug`);
    expect(res.ok()).toBe(true);

    const body = await res.json();
    expect(body).toHaveProperty("env");
    expect(typeof body.env).toBe("object");
  });

  test("/debug expõe versão do Node", async ({ request }) => {
    const res = await request.get(`${VULN_BASE}/debug`);
    expect(res.ok()).toBe(true);

    const body = await res.json();
    expect(body).toHaveProperty("node");
    expect(body.node).toMatch(/^v\d+\.\d+\.\d+/);
  });
});
