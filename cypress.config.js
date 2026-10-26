const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
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
