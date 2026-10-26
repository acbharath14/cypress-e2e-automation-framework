const users = require('../../fixtures/users.json');
const InventoryPage = require('../../page-objects/InventoryPage');
const CheckoutPage = require('../../page-objects/CheckoutPage');

describe('checkout', () => {
  beforeEach(() => {
    cy.login(users.standard.username, users.standard.password);
  });

  it('completes checkout end to end', () => {
    cy.addToCart('Sauce Labs Backpack');
    cy.addToCart('Sauce Labs Bike Light');
    InventoryPage.goToCart();
    cy.checkoutAs('Ada', 'Lovelace', '20171');
    CheckoutPage.overviewItemNames()
      .should('contain', 'Sauce Labs Backpack')
      .and('contain', 'Sauce Labs Bike Light');
    CheckoutPage.subtotalLabel().should('contain', 'Item total: $39.98');
    CheckoutPage.taxLabel().should('contain', 'Tax: $3.20');
    CheckoutPage.totalLabel().should('contain', 'Total: $43.18');
    CheckoutPage.finish();
    CheckoutPage.completeHeader().should(
      'have.text',
      'Thank you for your order!',
    );
  });

  it('requires a first name at checkout', () => {
    cy.addToCart('Sauce Labs Backpack');
    InventoryPage.goToCart();
    cy.checkoutAs('', 'Lovelace', '20171');
    CheckoutPage.errorMessage().should('contain', 'First Name is required');
  });
});
