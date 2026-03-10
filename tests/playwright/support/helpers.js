/**
 * Helpers específicos do Playwright.
 * Usa shared/ para constants e factories.
 * Contém apenas lógica que usa page ou request.
 */

const { expect } = require("@playwright/test");

const {
  FRONTEND_URL,
  API_BASE_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_TOKEN,
  USERS_TABLE,
} = require("../../shared/constants");

const {
  randomName,
  randomEmail,
  randomAgeBetween18And80,
  randomRowIndex,
  getEditIdade,
  getThresholdMs,
  buildRandomUser,
} = require("../../shared/factories");

// Helpers de registro/login (env override)
function getRegisterName() {
  return process.env.PW_REGISTER_NAME || process.env.CYPRESS_REGISTER_NAME || randomName();
}

function getRegisterEmail() {
  return process.env.PW_REGISTER_EMAIL || process.env.CYPRESS_REGISTER_EMAIL || randomEmail();
}

function getRegisterPassword() {
  return process.env.PW_REGISTER_PASSWORD || process.env.CYPRESS_REGISTER_PASSWORD || "senha123";
}

// Page interactions
async function visitPlayground(page) {
  await page.goto(FRONTEND_URL);
}

async function fillRegisterForm(page, data = {}) {
  if (data.name != null) await page.locator("#name").fill(String(data.name));
  if (data.email != null) await page.getByTestId("register-email").fill(String(data.email));
  if (data.password != null) await page.getByTestId("register-password").fill(String(data.password));
}

async function clickRegister(page) {
  await page.getByTestId("btn-register").click();
}

async function fillLoginForm(page, data = {}) {
  if (data.email != null) await page.getByTestId("login-email").fill(String(data.email));
  if (data.password != null) await page.getByTestId("login-password").fill(String(data.password));
}

async function clickLogin(page) {
  await page.getByTestId("btn-login").click();
}

function registerResponseLocator(page) {
  return page.locator('[data-testid="form-register"]').locator("xpath=../pre");
}

function loginResponseLocator(page) {
  return page.locator('[data-testid="form-login"]').locator("xpath=../pre");
}

async function assertRegisterSuccessOrAlreadyExists(page) {
  const response = registerResponseLocator(page);
  await expect(response).toBeVisible();
  const text = (await response.textContent()) || "";
  const ok201 = text.includes("Status: 201") && text.includes('"email"');
  const ok409 = text.includes("Status: 409") && /já existe|já em uso/i.test(text);
  expect(ok201 || ok409).toBeTruthy();
}

async function assertDashboardVisible(page) {
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText("Bem-vindo de volta")).toBeVisible();
  await expect(page.getByText("Sair")).toBeVisible();
}

async function loginAsAdmin(page) {
  await visitPlayground(page);
  await expect(page.getByTestId("form-login")).toBeVisible();
  await fillLoginForm(page, { email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  await clickLogin(page);
  await assertDashboardVisible(page);
}

async function ensureAdminTestUsers(request) {
  await request.post(`${API_BASE_URL}/auth/register`, {
    data: { name: randomName(), email: randomEmail(), password: "senha123" },
  });
  await request.post(`${API_BASE_URL}/auth/register`, {
    data: { name: randomName(), email: randomEmail(), password: "senha123" },
  });
}

async function waitForDashboardUsers(page, minimum = 2) {
  await expect
    .poll(async () => page.locator(USERS_TABLE).count(), { timeout: 10000 })
    .toBeGreaterThanOrEqual(minimum);
}

function getUserRow(page, index) {
  return page.locator(USERS_TABLE).nth(index);
}

async function clickEditOnRow(page, index) {
  await getUserRow(page, index).locator('[data-testid^="btn-edit-"]').click();
}

async function setRowInactive(page, index) {
  await clickEditOnRow(page, index);
  await page.getByTestId("modal-edit-ativo").uncheck({ force: true });
  await page.getByTestId("modal-edit-save").click();
  await expect(page.getByTestId("modal-edit-idade")).not.toBeVisible();
}

module.exports = {
  FRONTEND_URL,
  API_BASE_URL,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_TOKEN,
  USERS_TABLE,
  randomName,
  randomEmail,
  randomAgeBetween18And80,
  randomRowIndex,
  getRegisterName,
  getRegisterEmail,
  getRegisterPassword,
  getEditIdade,
  getThresholdMs,
  buildRandomUser,
  visitPlayground,
  fillRegisterForm,
  clickRegister,
  fillLoginForm,
  clickLogin,
  registerResponseLocator,
  loginResponseLocator,
  assertRegisterSuccessOrAlreadyExists,
  assertDashboardVisible,
  loginAsAdmin,
  ensureAdminTestUsers,
  waitForDashboardUsers,
  getUserRow,
  clickEditOnRow,
  setRowInactive,
};
