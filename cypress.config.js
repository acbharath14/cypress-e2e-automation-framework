const { defineConfig } = require('cypress');
const { allureCypress } = require('allure-cypress/reporter');

module.exports = defineConfig({
  e2e: {
    // Allure results are written on every run by the official Allure
    // adapter (allure-cypress 3.12.2+ is required for Cypress 16).
    // Mochawesome stays as the reporter — the adapter works through
    // setupNodeEvents, not the reporter field, so both reports coexist.
    setupNodeEvents(on, config) {
      allureCypress(on, config, {
        resultsDir: 'allure-results',
      });
      return config;
    },
    baseUrl: 'https://www.saucedemo.com',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    video: true,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'mochawesome-report',
      overwrite: false,
      html: true,
      json: true,
      charts: true,
      reportPageTitle: 'Cypress E2E Report',
    },
  },
  // Public configuration, read in tests with Cypress.expose(). Cypress 16
  // removed Cypress.env(); the apiUrl default here is overridden per run by
  // scripts/run-tests.cjs with --expose.
  expose: {
    apiUrl: 'http://localhost:3000',
  },
});
