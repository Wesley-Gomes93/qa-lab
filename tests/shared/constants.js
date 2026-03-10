/**
 * Constantes compartilhadas entre Cypress e Playwright.
 * Única fonte de verdade para URLs, credenciais e textos comuns.
 */

const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CYPRESS_BASE_URL || "http://localhost:3000";
const API_BASE_URL = process.env.API_BASE_URL || process.env.CYPRESS_API_BASE || "http://localhost:4000";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admWesley@test.com.br";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "senha12356";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-qa-lab";

/** Seletor da tabela de usuários no dashboard */
const USERS_TABLE = '[data-testid="table-users"] tbody tr';

/** Idade mínima e máxima para validação */
const AGE_MIN = 18;
const AGE_MAX = 80;

/** Default password para testes */
const DEFAULT_PASSWORD = "senha123";

module.exports = {
  FRONTEND_URL,
  API_BASE_URL,
  API_BASE: API_BASE_URL, // alias para compatibilidade Cypress
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  ADMIN_TOKEN,
  USERS_TABLE,
  AGE_MIN,
  AGE_MAX,
  DEFAULT_PASSWORD,
};
