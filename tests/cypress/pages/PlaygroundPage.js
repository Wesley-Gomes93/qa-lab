/**
 * Page Object: Playground (tela inicial do QA Lab)
 *
 * Centraliza o mapeamento de elementos e as ações da tela para facilitar
 * manutenção e reuso nos testes E2E.
 */

const BASE_URL = 'http://localhost:3000';

/**
 * Gera um nome aleatório para uso nos testes (evita conflito entre execuções).
 * @returns {string} Ex.: "User_1734a2f_xy9z"
 */
function getRandomName() {
  const suffix = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  return `User_${suffix}`;
}

/**
 * Gera um e-mail aleatório para uso nos testes.
 * @returns {string} Ex.: "user_1734a2f_xy9z@teste.com"
 */
function getRandomEmail() {
  const suffix = Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  return `user_${suffix}@teste.com`;
}

/**
 * Dados para registro/login: usa variáveis de ambiente (imersão) se definidas,
 * senão gera aleatório. Para passar dados ao rodar o teste:
 *   CYPRESS_REGISTER_NAME=João CYPRESS_REGISTER_EMAIL=joao@teste.com cypress run ...
 */
function getRegisterName() {
  const env = typeof Cypress !== 'undefined' && Cypress.env && Cypress.env('REGISTER_NAME');
  return env && String(env).trim() ? String(env).trim() : getRandomName();
}

function getRegisterEmail() {
  const env = typeof Cypress !== 'undefined' && Cypress.env && Cypress.env('REGISTER_EMAIL');
  return env && String(env).trim() ? String(env).trim() : getRandomEmail();
}

function getRegisterPassword() {
  const env = typeof Cypress !== 'undefined' && Cypress.env && Cypress.env('REGISTER_PASSWORD');
  return env && String(env).trim() ? String(env).trim() : 'senha123';
}
const selectors = {
  // Header
  header: 'header',
  title: 'h1',
  apiUrlCode: 'code',

  // Seção 1 - Healthcheck
  sectionHealthcheck: 'section',
  btnHealthcheck: '[data-testid="btn-healthcheck"]',

  // Seção 2 - Registrar usuário
  formRegister: '[data-testid="form-register"]',
  inputName: '#name',
  inputRegisterEmail: '[data-testid="register-email"]',
  inputRegisterPassword: '[data-testid="register-password"]',
  btnRegister: '[data-testid="btn-register"]',

  // Seção 3 - Login
  formLogin: '[data-testid="form-login"]',
  inputLoginEmail: '[data-testid="login-email"]',
  inputLoginPassword: '[data-testid="login-password"]',
  btnLogin: '[data-testid="btn-login"]',
};

/** Textos esperados na tela (para asserts e manutenção) */
const texts = {
  title: 'QA Lab – Playground de Testes',
  subtitle: 'Aqui você consegue brincar com a API (registro, login) e depois',
  apiUrlLabel: 'URL da API usada pelo site:',
  sectionHealthcheck: '1. Healthcheck da API',
  btnHealthcheck: 'Testar /health',
  sectionRegister: '2. Registrar usuário (/auth/register)',
  labelName: 'Nome',
  labelEmail: 'E-mail',
  labelPassword: 'Senha',
  placeholderName: 'Seu nome',
  placeholderEmail: 'voce@exemplo.com',
  btnRegister: 'Registrar',
  sectionLogin: '3. Login (/auth/login)',
  btnLogin: 'Login',
  errorRequired: 'email e password são obrigatórios',
  status400: 'Status: 400',
  status201: 'Status: 201',
  status200: 'Status: 200',
  status409: 'Status: 409',
  errorAlreadyExists: 'já existe',
  errorEmailInUse: 'já em uso',
};

/**
 * Acessa a página do Playground.
 */
function visit() {
  cy.visit(BASE_URL);
}

/**
 * Retorna o elemento do header (para encadear comandos).
 */
function getHeader() {
  return cy.get(selectors.header);
}

/**
 * Retorna o botão de healthcheck (para encadear comandos).
 */
function getBtnHealthcheck() {
  return cy.get(selectors.btnHealthcheck);
}

/**
 * Retorna o formulário de registro (para encadear comandos).
 */
function getFormRegister() {
  return cy.get(selectors.formRegister);
}

/**
 * Retorna o formulário de login (para encadear comandos).
 */
function getFormLogin() {
  return cy.get(selectors.formLogin);
}

/**
 * Preenche o formulário de registro (campos opcionais).
 * @param {Object} data - { name?, email?, password? }
 */
const TYPE_OPTS = { force: true };

function fillRegisterForm(data = {}) {
  getFormRegister().should('be.visible');
  if (data.name != null) {
    cy.get(selectors.inputName).clear(TYPE_OPTS).type(String(data.name), TYPE_OPTS);
  }
  if (data.email != null) {
    cy.get(selectors.inputRegisterEmail).clear(TYPE_OPTS).type(String(data.email), TYPE_OPTS);
  }
  if (data.password != null) {
    cy.get(selectors.inputRegisterPassword).clear(TYPE_OPTS).type(String(data.password), TYPE_OPTS);
  }
}

/**
 * Clica no botão Registrar.
 */
function clickRegister() {
  cy.get(selectors.btnRegister).click();
}

/**
 * Preenche o formulário de login.
 * @param {Object} data - { email, password }
 */
function fillLoginForm(data = {}) {
  getFormLogin().should('be.visible');
  if (data.email != null) {
    cy.get(selectors.inputLoginEmail).clear(TYPE_OPTS).type(String(data.email), TYPE_OPTS);
  }
  if (data.password != null) {
    cy.get(selectors.inputLoginPassword).clear(TYPE_OPTS).type(String(data.password), TYPE_OPTS);
  }
}

/**
 * Clica no botão Login.
 */
function clickLogin() {
  cy.get(selectors.btnLogin).click();
}

/**
 * Clica no botão "Testar /health".
 */
function clickHealthcheck() {
  cy.get(selectors.btnHealthcheck).click();
}

/**
 * Verifica se o header está visível com título e texto da API.
 */
function assertHeaderVisible() {
  getHeader().within(() => {
    cy.contains('h1', texts.title).should('be.visible');
    cy.contains('p', texts.subtitle).should('be.visible');
    cy.contains('p', texts.apiUrlLabel).should('be.visible');
    cy.get(selectors.apiUrlCode).should('contain.text', 'http://localhost:4000');
  });
}

/**
 * Verifica se a seção de healthcheck está visível com o botão correto.
 */
function assertSectionHealthcheckVisible() {
  cy.contains('h2', texts.sectionHealthcheck).should('be.visible');
  getBtnHealthcheck()
    .should('exist')
    .and('be.visible')
    .and('have.text', texts.btnHealthcheck);
}

/**
 * Verifica se o formulário de registro está visível com todos os campos e labels.
 */
function assertFormRegisterVisible() {
  cy.contains('h2', texts.sectionRegister).should('be.visible');
  getFormRegister().within(() => {
    cy.contains('label', texts.labelName).should('be.visible');
    cy.get(selectors.inputName)
      .should('exist')
      .and('have.attr', 'name', 'name')
      .and('have.attr', 'type', 'text')
      .and('have.attr', 'placeholder', texts.placeholderName);

    cy.contains('label', texts.labelEmail).should('be.visible');
    cy.get(selectors.inputRegisterEmail)
      .should('exist')
      .and('have.attr', 'name', 'email')
      .and('have.attr', 'type', 'email')
      .and('have.attr', 'placeholder', texts.placeholderEmail);

    cy.contains('label', texts.labelPassword).should('be.visible');
    cy.get(selectors.inputRegisterPassword)
      .should('exist')
      .and('have.attr', 'name', 'password')
      .and('have.attr', 'type', 'password');

    cy.get(selectors.btnRegister)
      .should('exist')
      .and('be.visible')
      .and('have.text', texts.btnRegister);
  });
}

/**
 * Verifica se o formulário de login está visível com todos os campos e labels.
 */
function assertFormLoginVisible() {
  cy.contains('h2', texts.sectionLogin).should('be.visible');
  getFormLogin().within(() => {
    cy.contains('label', texts.labelEmail).should('be.visible');
    cy.get(selectors.inputLoginEmail)
      .should('exist')
      .and('have.attr', 'name', 'email')
      .and('have.attr', 'type', 'email')
      .and('have.attr', 'placeholder', texts.placeholderEmail);

    cy.contains('label', texts.labelPassword).should('be.visible');
    cy.get(selectors.inputLoginPassword)
      .should('exist')
      .and('have.attr', 'name', 'password')
      .and('have.attr', 'type', 'password');

    cy.get(selectors.btnLogin)
      .should('exist')
      .and('be.visible')
      .and('have.text', texts.btnLogin);
  });
}

/**
 * Verifica se todos os elementos da tela estão visíveis (validação completa da UI).
 */
function assertAllElementsVisible() {
  assertHeaderVisible();
  assertSectionHealthcheckVisible();
  assertFormRegisterVisible();
  assertFormLoginVisible();
}

/**
 * Verifica se a mensagem de erro de validação (400) aparece na tela.
 * Espera o bloco de resposta da API aparecer antes de validar o texto.
 */
function assertValidationErrorVisible() {
  cy.get(selectors.formRegister)
    .parent()
    .find('pre')
    .should('be.visible')
    .and('contain.text', texts.status400)
    .and('contain.text', texts.errorRequired);
}

/**
 * Verifica se o registro foi bem-sucedido (Status: 201) ou se o usuário já existe (409).
 * Útil para reexecuções com os mesmos dados de imersão (e-mail já cadastrado).
 */
function assertRegisterSuccessOrAlreadyExists() {
  cy.get(selectors.formRegister)
    .parent()
    .find('pre')
    .should('be.visible');
  cy.get(selectors.formRegister)
    .parent()
    .find('pre')
    .then(($pre) => {
      const text = $pre.text();
      const is201 = text.includes(texts.status201) && text.includes('"id"') && text.includes('"email"');
      const is409 =
        text.includes(texts.status409) &&
        (text.includes(texts.errorAlreadyExists) || text.includes(texts.errorEmailInUse));
      expect(is201 || is409, 'esperado Status 201 (criado) ou 409 (já existe)').to.be.true;
    });
}

/**
 * Verifica se o registro foi bem-sucedido (Status: 201 e resumo do usuário no pre).
 */
function assertRegisterSuccessVisible() {
  cy.get(selectors.formRegister)
    .parent()
    .find('pre')
    .should('be.visible')
    .and('contain.text', texts.status201)
    .and('contain.text', '"id"')
    .and('contain.text', '"name"')
    .and('contain.text', '"email"');
}

/**
 * Verifica se o login foi bem-sucedido (Status: 200, token e user no pre).
 */
function assertLoginSuccessVisible() {
  cy.get(selectors.formLogin)
    .parent()
    .find('pre')
    .should('be.visible')
    .and('contain.text', texts.status200)
    .and('contain.text', 'token')
    .and('contain.text', 'user');
}

/**
 * Verifica se o login falhou (Status: 401, credenciais inválidas).
 */
function assertLoginFailVisible() {
  cy.get(selectors.formLogin)
    .parent()
    .find('pre')
    .should('be.visible')
    .and('contain.text', 'Status: 401')
    .and('contain.text', 'Credenciais inválidas');
}

/**
 * Verifica se os campos do formulário de registro existem e estão visíveis.
 */
function assertRegisterFormFieldsVisible() {
  cy.get(selectors.inputName).should('exist').and('be.visible');
  cy.get(selectors.inputRegisterEmail).should('exist').and('be.visible');
  cy.get(selectors.inputRegisterPassword).should('exist').and('be.visible');
}

module.exports = {
  BASE_URL,
  selectors,
  texts,
  getRandomName,
  getRandomEmail,
  getRegisterName,
  getRegisterEmail,
  getRegisterPassword,
  visit,
  getHeader,
  getBtnHealthcheck,
  getFormRegister,
  getFormLogin,
  fillRegisterForm,
  clickRegister,
  fillLoginForm,
  clickLogin,
  clickHealthcheck,
  assertHeaderVisible,
  assertSectionHealthcheckVisible,
  assertFormRegisterVisible,
  assertFormLoginVisible,
  assertAllElementsVisible,
  assertValidationErrorVisible,
  assertRegisterSuccessVisible,
  assertRegisterSuccessOrAlreadyExists,
  assertLoginSuccessVisible,
  assertLoginFailVisible,
  assertRegisterFormFieldsVisible,
};
