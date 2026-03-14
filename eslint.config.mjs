#!/usr/bin/env node
/**
 * QA Lab – ESLint Flat Config
 * Replicado do padrão qa-mockserver-mcp:
 * - rules: regras base + específicas por tipo de arquivo
 * - Blocos separados por pasta (backend, tests, agents, scripts)
 */

import eslint from "@eslint/js";
import globals from "globals";

async function createConfig() {
  const mocha = await import("eslint-plugin-mocha");

  // REGRAS BASE (compartilhadas entre backend, tests, agents, scripts)
  const baseRules = {
    // Variáveis e imports
    "no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "no-undef": "warn",
    "no-duplicate-imports": "error",
    "no-var": "warn",

    // Código limpo
    "no-debugger": "error",
    "no-alert": "error",
    "no-unreachable": "error",
    "no-empty": ["error", { allowEmptyCatch: true }],

    // Segurança
    "no-eval": "error",
    "no-implied-eval": "error",

    // Testes específicos (Mocha – Cypress usa describe/it)
    "mocha/no-exclusive-tests": "error",
    "mocha/no-identical-title": "error",

    // Formatação
    "max-len": [
      "warn",
      {
        code: 120,
        tabWidth: 2,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
  };

  const nodeGlobals = { ...globals.node };

  // Mocha/Cypress globals (describe, it, before, beforeEach, etc.)
  const mochaGlobals = {
    describe: "readonly",
    it: "readonly",
    before: "readonly",
    beforeEach: "readonly",
    after: "readonly",
    afterEach: "readonly",
    context: "readonly",
    specify: "readonly",
  };

  return [
    {
      ignores: [
        "**/node_modules/**",
        "**/.next/**",
        "**/dist/**",
        "tests/cypress.config.cjs",
        "tests/playwright.config.js",
        "tests/cypress/reports/**",
        "tests/playwright-report/**",
      ],
    },
    eslint.configs.recommended,
    // BACKEND – API Express
    {
      files: ["backend/**/*.js"],
      languageOptions: {
        globals: nodeGlobals,
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: "commonjs",
        },
      },
      plugins: { mocha: mocha.default },
      rules: baseRules,
    },
    // TESTS – Cypress e Playwright (Mocha aplica a describe/it do Cypress)
    {
      files: [
        "tests/**/*.cy.js",
        "tests/**/*.spec.js",
        "tests/shared/**/*.js",
        "tests/contract/**/*.js",
        "tests/scripts/**/*.js",
        "tests/cypress/**/*.js",
        "tests/playwright/**/*.js",
      ],
      languageOptions: {
        globals: {
          ...nodeGlobals,
          ...mochaGlobals,
          cy: "readonly",
          Cypress: "readonly",
          test: "readonly",
          expect: "readonly",
        },
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: "commonjs",
        },
      },
      plugins: { mocha: mocha.default },
      rules: baseRules,
    },
    // AGENTS – scripts Node.js
    {
      files: ["agents/**/*.js", "agents/**/server.js"],
      languageOptions: {
        globals: nodeGlobals,
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: "commonjs",
        },
      },
      plugins: { mocha: mocha.default },
      rules: baseRules,
    },
    // SCRIPTS – utilitários na raiz
    {
      files: ["scripts/**/*.js"],
      languageOptions: {
        globals: nodeGlobals,
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: "commonjs",
        },
      },
      plugins: { mocha: mocha.default },
      rules: baseRules,
    },
    // QA-EXTENDED-LAB – testes API, a11y e scripts Node.js
    {
      files: ["qa-extended-lab/**/*.js"],
      languageOptions: {
        globals: nodeGlobals,
        parserOptions: {
          ecmaVersion: 2022,
          sourceType: "commonjs",
        },
      },
      plugins: { mocha: mocha.default },
      rules: baseRules,
    },
  ];
}

export default createConfig();
