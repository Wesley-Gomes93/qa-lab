/**
 * Executa specs centralizados de shared/specs/api/.
 * Única implementação Playwright – os casos vêm dos arquivos .spec.js.
 */
const { test, expect } = require("@playwright/test");
const { API_BASE_URL } = require("../../support/helpers");
const fs = require("fs");
const path = require("path");

const SPECS_DIR = path.join(__dirname, "../../../shared/specs/api");
const specFiles = fs.existsSync(SPECS_DIR) ? fs.readdirSync(SPECS_DIR).filter((f) => f.endsWith(".spec.js")) : [];

async function runCase(request, spec, testCase) {
  const url = `${API_BASE_URL}${testCase.path}`;
  const options = { failOnStatusCode: false };
  if (testCase.headers) options.headers = testCase.headers;
  if (testCase.body) options.data = testCase.body;

  const method = testCase.method.toLowerCase();
  const res = method === "get" ? await request.get(url, options)
    : method === "post" ? await request.post(url, options)
    : method === "put" ? await request.put(url, options)
    : method === "delete" ? await request.delete(url, options)
    : await request.fetch(url, { method: testCase.method, ...options });

  expect(res.status()).toBe(testCase.expectStatus);

  const body = await res.json();
  if (testCase.expectBody) {
    Object.entries(testCase.expectBody).forEach(([k, v]) => {
      const val = k.includes(".") ? k.split(".").reduce((o, key) => o?.[key], body) : body[k];
      expect(val).toBe(v);
    });
  }
  if (testCase.expectBodyKeys) {
    testCase.expectBodyKeys.forEach((k) => {
      expect(body).toHaveProperty(k);
    });
  }
  if (testCase.expectNestedKeys) {
    Object.entries(testCase.expectNestedKeys).forEach(([parent, keys]) => {
      keys.forEach((k) => {
        expect(body[parent]).toHaveProperty(k);
      });
    });
  }
}

specFiles.forEach((file) => {
  const specPath = path.join(SPECS_DIR, file);
  const spec = require(specPath);

  test.describe(spec.title, () => {
    spec.cases.forEach((testCase) => {
      test(testCase.name, async ({ request }) => runCase(request, spec, testCase));
    });
  });
});
