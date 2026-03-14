const { defineConfig } = require('cypress');

const isCI = !!process.env.CI;

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    charts: true,
    reportPageTitle: 'QA Lab - Test Report',
    embeddedScreenshots: true,
    saveJson: true,
  },
  e2e: {
    baseUrl: 'http://localhost:4000',
    specPattern: 'cypress/e2e/**/*.cy.js',
    retries: isCI ? 1 : 0,
    defaultCommandTimeout: isCI ? 15000 : 8000,
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
    },
  },
});

