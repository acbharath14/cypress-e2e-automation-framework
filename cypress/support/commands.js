const { buttonId } = require('./saucedemo');

Cypress.Commands.add('login', (username, password) => {
  cy.visit('/');
  cy.get('[data-test="username"]').type(username);
  cy.get('[data-test="password"]').type(password, { log: false });
  cy.get('[data-test="login-button"]').click();
});

Cypress.Commands.add('addToCart', (productName) => {
  cy.get(`[data-test="${buttonId('add-to-cart', productName)}"]`).click();
});

// Assumes the test is on the cart page. Fills the checkout form and
// continues to the overview step. Empty values are skipped so a spec can
// deliberately trigger a required-field error.
Cypress.Commands.add('checkoutAs', (firstName, lastName, postalCode) => {
  cy.get('[data-test="checkout"]').click();
  if (firstName) {
    cy.get('[data-test="firstName"]').type(firstName);
  }
  if (lastName) {
    cy.get('[data-test="lastName"]').type(lastName);
  }
  if (postalCode) {
    cy.get('[data-test="postalCode"]').type(postalCode);
  }
  cy.get('[data-test="continue"]').click();
});

// Stub API request. The API key header is handled here so specs stay
// readable. Pass apiKey: null to send no key (for the 401 test).
// apiUrl is public config, read with Cypress.expose() — Cypress 16
// removed Cypress.env(), and this URL is not sensitive.
Cypress.Commands.add('apiRequest', (method, path, options = {}) => {
  const { apiKey, headers, ...rest } = options;
  const requestHeaders = { ...(headers || {}) };
  if (apiKey !== null) {
    requestHeaders['x-api-key'] = apiKey || 'test-key';
  }
  return cy.request({
    method,
    url: `${Cypress.expose('apiUrl')}${path}`,
    headers: requestHeaders,
    failOnStatusCode: false,
    ...rest,
  });
});
