class InventoryPage {
  title(options = {}) {
    return cy.get('[data-test="title"]', options);
  }

  sortBy(value) {
    cy.get('[data-test="product-sort-container"]').select(value);
  }

  itemNames() {
    return cy.get('[data-test="inventory-item-name"]');
  }

  itemCount() {
    return cy.get('[data-test="inventory-item"]');
  }

  // Price text for one product row, found by product name.
  priceFor(productName) {
    return cy
      .contains('[data-test="inventory-item-name"]', productName)
      .parents('[data-test="inventory-item"]')
      .find('[data-test="inventory-item-price"]');
  }

  goToCart() {
    cy.get('[data-test="shopping-cart-link"]').click();
  }

  cartBadge() {
    return cy.get('[data-test="shopping-cart-badge"]');
  }
}

module.exports = new InventoryPage();
