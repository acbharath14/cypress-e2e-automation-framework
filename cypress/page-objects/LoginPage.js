class LoginPage {
  visit() {
    cy.visit('/');
  }

  login(username, password) {
    cy.get('[data-test="username"]').type(username);
    cy.get('[data-test="password"]').type(password, { log: false });
    cy.get('[data-test="login-button"]').click();
  }

  errorMessage() {
    return cy.get('[data-test="error"]');
  }
}

module.exports = new LoginPage();
