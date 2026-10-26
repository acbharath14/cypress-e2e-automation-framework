const { buttonId } = require('../support/saucedemo');

class CartPage {
  // The cart page reuses data-test="inventory-item" on its item wrappers
  // (there is no data-test="cart-item" — verified against the live page).
  cartItemNames() {
    return cy.get('[data-test="inventory-item"] [data-test="inventory-item-name"]');
  }

  removeItem(productName) {
    cy.get(`[data-test="${buttonId('remove', productName)}"]`).click();
  }

  cartBadge() {
    return cy.get('[data-test="shopping-cart-badge"]');
  }
}

module.exports = new CartPage();
