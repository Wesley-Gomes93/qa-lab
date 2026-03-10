/**
 * Factories compartilhadas entre Cypress e Playwright.
 * Funções puras para gerar dados de teste – sem dependência de cy ou page.
 */

const { AGE_MIN, AGE_MAX, DEFAULT_PASSWORD } = require("./constants");

function randomSuffix() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function randomName() {
  return `User_${randomSuffix()}`;
}

function randomEmail() {
  return `user_${randomSuffix()}@teste.com`;
}

function randomAgeBetween18And80() {
  return Math.floor(Math.random() * (AGE_MAX - AGE_MIN + 1)) + AGE_MIN;
}

function randomRowIndex(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Cria objeto de usuário para registro.
 * @param {Object} overrides - Sobrescreve campos específicos
 */
function buildRandomUser(overrides = {}) {
  return {
    name: randomName(),
    email: randomEmail(),
    password: DEFAULT_PASSWORD,
    ...overrides,
  };
}

/**
 * Lê inteiro de variáveis de ambiente (compatível Cypress/Playwright).
 * @param {string[]} names - Ex: ['PW_EDIT_IDADE', 'CYPRESS_EDIT_IDADE']
 * @param {number} fallback
 */
function readIntegerEnv(names, fallback) {
  const keys = Array.isArray(names) ? names : [names];
  for (const key of keys) {
    const raw = process.env[key];
    if (raw != null && String(raw).trim() !== "") {
      const n = parseInt(String(raw), 10);
      if (Number.isFinite(n)) return n;
    }
  }
  return fallback;
}

function getEditIdade() {
  const n = readIntegerEnv(["PW_EDIT_IDADE", "CYPRESS_EDIT_IDADE", "EDIT_IDADE"], NaN);
  if (Number.isFinite(n) && n >= AGE_MIN && n <= AGE_MAX) return n;
  return randomAgeBetween18And80();
}

function getThresholdMs(names, fallback) {
  const n = readIntegerEnv(names, fallback);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

module.exports = {
  randomSuffix,
  randomName,
  randomEmail,
  randomAgeBetween18And80,
  randomRowIndex,
  buildRandomUser,
  readIntegerEnv,
  getEditIdade,
  getThresholdMs,
};
