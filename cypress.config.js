const { defineConfig } = require('cypress');
const { allureCypress } = require('allure-cypress/reporter');

module.exports = defineConfig({
  projectId: '5887if',
  e2e: {
    // Allure results are written on every run by the official Allure
    // adapter (allure-cypress 3.12.2+ is required for Cypress 16).
    // Mochawesome stays as the reporter — the adapter works through
    // setupNodeEvents, not the reporter field, so both reports coexist.
    setupNodeEvents(on, config) {
      allureCypress(on, config, {
        resultsDir: 'allure-results',
      });
      // Test tagging (@cypress/grep): enables --env grepTags=... runs.
      const { plugin: cypressGrepPlugin } = require('@cypress/grep/plugin');
      cypressGrepPlugin(config);
      return config;
    },
    // Environment-based config: CYPRESS_BASE_URL overrides the UI target
    // (default: Swag Labs). Useful for pointing the suite at a staging
    // deployment without editing this file.
    baseUrl: process.env.CYPRESS_BASE_URL || 'https://www.saucedemo.com',
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
  // scripts/run-tests.cjs with --expose, and can also be overridden with
  // CYPRESS_API_URL (for runs that do not go through run-tests.cjs).
  expose: {
    apiUrl: process.env.CYPRESS_API_URL || 'http://localhost:3000',
  },
});
