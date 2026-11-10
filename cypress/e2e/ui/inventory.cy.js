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

  // One behavior (the sort control orders the list), one row per sort
  // option with the expected first item.
  const sortCases = [
    { label: 'A to Z', option: 'az', first: 'Sauce Labs Backpack' },
    {
      label: 'Z to A',
      option: 'za',
      first: 'Test.allTheThings() T-Shirt (Red)',
    },
    { label: 'price low to high', option: 'lohi', first: 'Sauce Labs Onesie' },
    {
      label: 'price high to low',
      option: 'hilo',
      first: 'Sauce Labs Fleece Jacket',
    },
  ];

  sortCases.forEach(({ label, option, first }) => {
    it(`sorts products ${label}`, () => {
      InventoryPage.sortBy(option);
      InventoryPage.itemNames().first().should('have.text', first);
    });
  });
});
