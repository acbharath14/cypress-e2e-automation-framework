const { buttonId } = require('../support/saucedemo');

class CartPage {
  cartItemNames() {
    return cy.get('[data-test="cart-item"] [data-test="inventory-item-name"]');
  }

  removeItem(productName) {
    cy.get(`[data-test="${buttonId('remove', productName)}"]`).click();
  }

  cartBadge() {
    return cy.get('[data-test="shopping-cart-badge"]');
  }
}

module.exports = new CartPage();
