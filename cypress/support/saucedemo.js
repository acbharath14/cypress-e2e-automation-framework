// Shared Swag Labs helpers. Product button ids on saucedemo follow the
// product name slug, with one exception: the "Test.allTheThings()" shirt
// keeps its dots and parentheses in the data-test value.
const BUTTON_OVERRIDES = {
  'Test.allTheThings() T-Shirt (Red)': 'test.allthethings()-t-shirt-(red)',
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function buttonId(action, productName) {
  const slug = BUTTON_OVERRIDES[productName] || slugify(productName);
  return `${action}-${slug}`;
}

module.exports = { buttonId, slugify };
