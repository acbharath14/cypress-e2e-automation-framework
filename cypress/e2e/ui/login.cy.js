const users = require('../../fixtures/users.json');
const LoginPage = require('../../page-objects/LoginPage');
const InventoryPage = require('../../page-objects/InventoryPage');

describe('login', () => {
  beforeEach(() => {
    LoginPage.visit();
  });

  // One behavior (a successful login lands on the inventory page), one row
  // per user. The glitch user loads slowly, so its row carries a per-row
  // timeout for the inventory title.
  const validUsers = [
    { label: 'standard', user: users.standard, tags: '@smoke' },
    { label: 'problem', user: users.problem },
    { label: 'glitch', user: users.glitch, options: { timeout: 15000 } },
  ];

  validUsers.forEach(({ label, user, tags, options }) => {
    it(
      `logs in the ${label} user and lands on the inventory page`,
      tags ? { tags } : {},
      () => {
        LoginPage.login(user.username, user.password);
        InventoryPage.title(options).should('have.text', 'Products');
      },
    );
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
});
