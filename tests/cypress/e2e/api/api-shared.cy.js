/**
 * Executa specs centralizados de shared/specs/api/.
 * Única implementação Cypress – os casos vêm dos arquivos .spec.js.
 */
const { API_BASE } = require("../../support/helpers");
const fs = require("fs");
const path = require("path");

const SPECS_DIR = path.join(__dirname, "../../../shared/specs/api");
const specFiles = fs.existsSync(SPECS_DIR) ? fs.readdirSync(SPECS_DIR).filter((f) => f.endsWith(".spec.js")) : [];

function runCase(spec, testCase) {
  const url = `${API_BASE}${testCase.path}`;
  const options = {
    method: testCase.method,
    url,
    failOnStatusCode: false,
  };
  if (testCase.headers) options.headers = testCase.headers;
  if (testCase.body) options.body = testCase.body;

  cy.request(options).then((res) => {
    expect(res.status).to.eq(testCase.expectStatus);
    if (testCase.expectBody) {
      Object.entries(testCase.expectBody).forEach(([k, v]) => {
        expect(res.body).to.have.property(k, v);
      });
    }
    if (testCase.expectBodyKeys) {
      testCase.expectBodyKeys.forEach((k) => {
        expect(res.body).to.have.property(k);
      });
    }
    if (testCase.expectNestedKeys) {
      Object.entries(testCase.expectNestedKeys).forEach(([parent, keys]) => {
        keys.forEach((k) => {
          expect(res.body[parent]).to.have.property(k);
        });
      });
    }
  });
}

specFiles.forEach((file) => {
  const specPath = path.join(SPECS_DIR, file);
  const spec = require(specPath);

  describe(spec.title, () => {
    spec.cases.forEach((testCase) => {
      it(testCase.name, () => runCase(spec, testCase));
    });
  });
});
