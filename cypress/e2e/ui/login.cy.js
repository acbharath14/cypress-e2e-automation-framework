const users = require('../../fixtures/users.json');
const LoginPage = require('../../page-objects/LoginPage');
const InventoryPage = require('../../page-objects/InventoryPage');

describe('login', () => {
  beforeEach(() => {
    LoginPage.visit();
  });

  it('logs in with valid credentials and lands on the inventory page', () => {
    LoginPage.login(users.standard.username, users.standard.password);
    InventoryPage.title().should('have.text', 'Products');
  });

  it('shows an error for a locked-out user', () => {
    LoginPage.login(users.lockedOut.username, users.lockedOut.password);
    LoginPage.errorMessage().should('contain', 'locked out');
  });

  it('shows an error for a wrong password', () => {
    LoginPage.login(users.standard.username, 'wrong-password');
    LoginPage.errorMessage().should(
      'contain',
      'Username and password do not match',
    );
  });

  it('logs in the problem user', () => {
    LoginPage.login(users.problem.username, users.problem.password);
    InventoryPage.title().should('have.text', 'Products');
  });

  it('logs in the slow performance-glitch user', () => {
    LoginPage.login(users.glitch.username, users.glitch.password);
    InventoryPage.title({ timeout: 15000 }).should('have.text', 'Products');
  });
});
