class CheckoutPage {
  overviewItemNames() {
    return cy.get('[data-test="inventory-item-name"]');
  }

  subtotalLabel() {
    return cy.get('[data-test="subtotal-label"]');
  }

  taxLabel() {
    return cy.get('[data-test="tax-label"]');
  }

  totalLabel() {
    return cy.get('[data-test="total-label"]');
  }

  finish() {
    cy.get('[data-test="finish"]').click();
  }

  completeHeader() {
    return cy.get('[data-test="complete-header"]');
  }

  errorMessage() {
    return cy.get('[data-test="error"]');
  }
}

module.exports = new CheckoutPage();
