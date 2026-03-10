/**
 * Selectors compartilhados entre Cypress e Playwright.
 * Única fonte de verdade para data-testid e seletores comuns.
 */

const { USERS_TABLE } = require("./constants");

const selectors = {
  // Playground
  formRegister: '[data-testid="form-register"]',
  formLogin: '[data-testid="form-login"]',
  inputName: "#name",
  registerEmail: '[data-testid="register-email"]',
  registerPassword: '[data-testid="register-password"]',
  loginEmail: '[data-testid="login-email"]',
  loginPassword: '[data-testid="login-password"]',
  btnRegister: '[data-testid="btn-register"]',
  btnLogin: '[data-testid="btn-login"]',
  btnHealthcheck: '[data-testid="btn-healthcheck"]',

  // Dashboard
  usersTable: USERS_TABLE,
  btnEdit: '[data-testid^="btn-edit-"]',
  modalEditIdade: '[data-testid="modal-edit-idade"]',
  modalEditAtivo: '[data-testid="modal-edit-ativo"]',
  modalEditSave: '[data-testid="modal-edit-save"]',
};

module.exports = {
  selectors,
};
