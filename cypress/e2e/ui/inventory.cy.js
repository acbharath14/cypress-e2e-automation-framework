const users = require('../../fixtures/users.json');
const products = require('../../fixtures/products.json');
const InventoryPage = require('../../page-objects/InventoryPage');

describe('inventory', () => {
  beforeEach(() => {
    cy.login(users.standard.username, users.standard.password);
  });

  it('shows every product from the fixture', { tags: '@smoke' }, () => {
    InventoryPage.itemCount().should('have.length', products.length);
    products.forEach((product) => {
      InventoryPage.itemNames().should('contain', product.name);
    });
  });

  it('shows the fixture prices on the site', () => {
    // Deliberate drift check: if Swag Labs changes a price, this fails
    // with a clear mismatch against products.json.
    products.forEach((product) => {
      InventoryPage.priceFor(product.name).should(
        'contain',
        `$${product.price}`,
      );
    });
  });

  it('sorts products A to Z', () => {
    InventoryPage.sortBy('az');
    InventoryPage.itemNames()
      .first()
      .should('have.text', 'Sauce Labs Backpack');
  });

  it('sorts products Z to A', () => {
    InventoryPage.sortBy('za');
    InventoryPage.itemNames()
      .first()
      .should('have.text', 'Test.allTheThings() T-Shirt (Red)');
  });

  it('sorts products by price low to high', () => {
    InventoryPage.sortBy('lohi');
    InventoryPage.itemNames().first().should('have.text', 'Sauce Labs Onesie');
  });

  it('sorts products by price high to low', () => {
    InventoryPage.sortBy('hilo');
    InventoryPage.itemNames()
      .first()
      .should('have.text', 'Sauce Labs Fleece Jacket');
  });
});
