# cypress-e2e-automation-framework

A Cypress end-to-end automation framework: Page Objects, fixtures, custom
commands, UI tests on Swag Labs and API tests on an in-repo stub, with CI.

This repo exists to show the whole shape of a Cypress suite, not just a few
passing specs: how tests are organized, where test data lives, how repeated
steps are shared, and how the suite runs locally and in CI. If you are new
to Cypress, start with [Quick start](#quick-start), then read
[How the tests are organized](#how-the-tests-are-organized).

## Quick start

You need Node.js 22 or newer and npm. No other local setup is required:
the UI tests run against a public demo site, and the API tests run against
a small server that lives in this repo.

```sh
npm run setup
npm test
```

`npm run setup` runs the preflight check (see [Preflight](#preflight)).
`npm test` starts the stub API, waits until it answers, runs the full
Cypress suite, then stops the stub. The first Cypress run downloads the
Cypress binary (about 100 MB) if it is not already installed; if that
download is blocked on your machine, run `npx cypress install` directly
and then `npm test` again.

To open the interactive Cypress runner instead:

```sh
npm run cy:open
```

## What gets tested

**UI tests** run against [Swag Labs](https://www.saucedemo.com), a public
demo shop built for end-to-end practice. They cover:

- Login: valid login, locked-out user, wrong password, slow
  (`performance_glitch`) user
- Inventory: product names and prices, sorting (A–Z, Z–A, price low–high,
  price high–low)
- Cart: adding items, the cart badge count, removing items
- Checkout: the full journey from cart to order confirmation, plus the
  empty-first-name validation error

**API tests** run against the stub API in `stub-api/` (plain Express,
started on `localhost:3000` by `npm test`). They cover the items CRUD
lifecycle (create, read, update, patch, delete) and the negative paths:
401 for a missing API key, 404 for an unknown id, 422 for an invalid body.

## Project layout

```
cypress.config.js        Cypress configuration (base URL, retries, reports)
eslint.config.mjs        ESLint flat config for the test code (see below)
cypress/
  e2e/
    ui/                  UI specs: login, inventory, cart, checkout
    api/                 API specs: items CRUD + negative paths
  page-objects/          One class per page: selectors + page actions
  fixtures/              Test data: users.json, products.json
  support/
    e2e.js               Loads custom commands for every spec
    commands.js          cy.login, cy.addToCart, cy.checkoutAs, cy.apiRequest
    saucedemo.js         Shared helper: product button ids on Swag Labs
stub-api/
  server.js              The stub API (Express, in-memory items)
  package.json           Stub-only dependencies
scripts/
  preflight.cjs          Setup checks + missing installs (runs before tests)
  run-tests.cjs          Starts the stub, runs Cypress, stops the stub
ci/
  github-actions.yml     CI TEMPLATE — paste it into .github/workflows/
```

## How the tests are organized

**Page Objects.** Each page has one class under `cypress/page-objects/`
(`LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage`). Selectors live
in the page class as getters, actions live as methods, and spec files
never call `cy.get()` directly — they talk to pages. When Swag Labs
changes a selector, you fix it in one place.

**Fixtures.** Test data lives in `cypress/fixtures/` as JSON, not hard-coded
in specs. `users.json` holds the four Swag Labs users (standard,
locked-out, problem, performance-glitch). `products.json` holds the six
product names and prices. The inventory spec asserts the site against
`products.json`, so if Swag Labs ever changes a price, the test fails
explicitly and says so — that drift check is deliberate, not a flaky test.

**Custom commands.** Repeated multi-step flows live in
`cypress/support/commands.js`: `cy.login(username, password)`,
`cy.addToCart(productName)`, `cy.checkoutAs(firstName, lastName,
postalCode)`, and `cy.apiRequest(method, path, options)` for the stub API
(the API key header is handled inside the command, so specs stay readable).

## Reports

Every run produces:

- **Mochawesome HTML report** in `mochawesome-report/` — the readable
  pass/fail summary.
- **Allure results** in `allure-results/` — machine-readable test results
  (suites, tests, steps, timing, attachments) written by the official
  Allure adapter (`allure-cypress`). Mochawesome stays as the reporter;
  the adapter works through `setupNodeEvents`, so both reports come out
  of the same run.
- **Screenshots** in `cypress/screenshots/` — captured automatically when
  a test fails.
- **Videos** in `cypress/videos/` — a recording of each spec run.

To view the Allure report, generate the static HTML version or serve the
results live (both need Java 17+ for the Allure commandline tool):

- `npm run allure:generate` — writes the static report to `allure-report/`
  (open `allure-report/index.html`).
- `npm run allure:serve` — serves the report from `allure-results/`
  directly, no generate step.

CI uploads all of these as artifacts on every run, pass or fail.

## Lint, environments, and tags

- **Lint:** `npm run lint` runs ESLint over `cypress/`
  (eslint-plugin-cypress recommended rules). Run it before pushing.
- **Environments:** `CYPRESS_BASE_URL` overrides the UI target (default
  Swag Labs) and `CYPRESS_API_URL` overrides the stub URL (default
  `http://localhost:3000`). Example:
  `CYPRESS_BASE_URL=https://staging.example.com npm test`. Note:
  `npm test` always passes `--expose apiUrl=...` for the stub it
  starts, which wins over `CYPRESS_API_URL` for that run; the variable
  applies to runs that do not go through `run-tests.cjs`.
- **Tags:** the happy-path tests carry `{ tags: '@smoke' }` (valid
  login, inventory list, add to cart, complete checkout). Run just
  those with `npm test -- --expose grepTags=@smoke` — Cypress 16 uses
  `--expose`, not `--env`. Add `{ tags: '@name' }` to any test or
  describe block to grow the tagged sets.

## CI

The workflow file in `ci/github-actions.yml` is a **template**, not a live
workflow: the GitHub App used for pushes cannot write
`.github/workflows/` files. To enable CI, paste that file's contents into
`.github/workflows/cypress.yml` via the GitHub web UI (keep the `"on":`
key quoted — a bare `on:` parses as boolean `true` in some YAML
validators and GitHub then registers zero triggers). CI installs both
`package.json` trees, runs `npm test`, generates the static Allure report (Java 17 is set up for that step), and uploads the reports. Report generation never fails the build (that step has `continue-on-error`).

## Preflight

`npm run setup` runs `scripts/preflight.cjs` before anything else. It
checks Node 22+, installs any missing `node_modules` (root and stub) with
`npm ci`, and checks the Cypress binary — installing a browser or driver
is never done for you; if the binary is missing it prints the exact fix
command (`npx cypress install`) and continues with a warning. To skip
preflight for a single run:

```sh
PREFLIGHT=0 npm test
```

## Adapting this framework

- **A new page:** add a class in `cypress/page-objects/` (selectors as
  getters, actions as methods), then use it from a spec.
- **A new spec:** add a `.cy.js` file under `cypress/e2e/ui/` or
  `cypress/e2e/api/` — the `specPattern` picks it up automatically.
- **New test data:** add it to `cypress/fixtures/` and load it with
  `require()` in the spec, the way the login spec loads `users.json`.
- **A new stub endpoint:** add the route in `stub-api/server.js` and a
  spec in `cypress/e2e/api/` that exercises it through `cy.apiRequest`.

## Known limits

- **Swag Labs is external.** If saucedemo.com is down, the UI specs fail
  through no fault of this repo. The API specs are unaffected — they only
  ever touch the local stub.
- **Fixture drift fails loudly on purpose.** If Swag Labs changes a
  product name or price, the inventory spec fails with a clear mismatch
  against `products.json`. Update the fixture, don't weaken the assertion.
- **The stub is in-memory.** Restarting it wipes all items. That is fine
  for tests (every run starts clean) and wrong for anything real.
- **Scripts target macOS, Linux, and CI.** `scripts/run-tests.cjs` spawns
  `npx` directly, which works on macOS/Linux; Windows needs `npx.cmd`
  handling that is not in this scaffold.
- **Cypress 16 notes.** `Cypress.env()` was removed in Cypress 16, so the
  stub URL is public config: set in `cypress.config.js` under `expose`,
  read in specs with `Cypress.expose('apiUrl')`, and overridden per run
  by `scripts/run-tests.cjs` with `--expose`. Cypress 16 also deprecates
  the Electron browser, but it still works, so CI uses Cypress's default
  browser.
