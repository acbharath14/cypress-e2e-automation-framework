const users = require('../../fixtures/users.json');
const InventoryPage = require('../../page-objects/InventoryPage');
const CartPage = require('../../page-objects/CartPage');

describe('cart', () => {
  beforeEach(() => {
    cy.login(users.standard.username, users.standard.password);
  });

  it('adds items and shows them in the cart', () => {
    cy.addToCart('Sauce Labs Backpack');
    cy.addToCart('Sauce Labs Bike Light');
    InventoryPage.cartBadge().should('have.text', '2');
    InventoryPage.goToCart();
    CartPage.cartItemNames()
      .should('contain', 'Sauce Labs Backpack')
      .and('contain', 'Sauce Labs Bike Light');
  });

  it('removing an item updates the badge and the cart', () => {
    cy.addToCart('Sauce Labs Backpack');
    cy.addToCart('Sauce Labs Bike Light');
    InventoryPage.goToCart();
    CartPage.removeItem('Sauce Labs Bike Light');
    CartPage.cartItemNames()
      .should('contain', 'Sauce Labs Backpack')
      .and('not.contain', 'Sauce Labs Bike Light');
    CartPage.cartBadge().should('have.text', '1');
  });
});
