// Test runner: preflight, then start the stub API, wait until it answers,
// run Cypress, stop the stub, and exit with Cypress's exit code.
// Stdlib only. Extra arguments are passed through to `cypress run`
// (for example: npm test -- --spec cypress/e2e/api/items-api.cy.js).
// Skip preflight for one run with PREFLIGHT=0 or --no-preflight.
'use strict';

const { spawn, spawnSync } = require('node:child_process');
const http = require('node:http');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 3000;
const HEALTH_URL = `http://127.0.0.1:${PORT}/health`;

const args = process.argv.slice(2);
const skipPreflight =
  process.env.PREFLIGHT === '0' || args.includes('--no-preflight');
const cypressArgs = args.filter((arg) => arg !== '--no-preflight');

function waitForHealth(timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve) => {
    const attempt = () => {
      const request = http.get(HEALTH_URL, (response) => {
        response.resume();
        if (response.statusCode === 200) {
          resolve(true);
        } else if (Date.now() < deadline) {
          setTimeout(attempt, 500);
        } else {
          resolve(false);
        }
      });
      request.on('error', () => {
        if (Date.now() < deadline) {
          setTimeout(attempt, 500);
        } else {
          resolve(false);
        }
      });
    };
    attempt();
  });
}

async function main() {
  if (!skipPreflight) {
    const preflight = spawnSync(
      process.execPath,
      [path.join(__dirname, 'preflight.cjs')],
      { cwd: ROOT, stdio: 'inherit' },
    );
    if (preflight.status !== 0) {
      process.exit(preflight.status || 1);
    }
  }

  const stub = spawn(
    process.execPath,
    [path.join(ROOT, 'stub-api', 'server.js')],
    {
      cwd: ROOT,
      env: { ...process.env, PORT: String(PORT) },
      stdio: 'inherit',
    },
  );

  const healthy = await waitForHealth(15000);
  if (!healthy) {
    console.error(`run-tests: stub API did not answer ${HEALTH_URL} in 15s.`);
    stub.kill('SIGTERM');
    process.exit(1);
  }

  // The stub's URL reaches the specs as public config via --expose
  // (Cypress 16 removed Cypress.env(); this URL is not sensitive).
  const cypress = spawnSync(
    'npx',
    [
      'cypress',
      'run',
      '--expose',
      `apiUrl=http://localhost:${PORT}`,
      ...cypressArgs,
    ],
    {
      cwd: ROOT,
      stdio: 'inherit',
      env: { ...process.env },
    },
  );

  stub.kill('SIGTERM');
  process.exit(cypress.status === null ? 1 : cypress.status);
}

main().catch((error) => {
  console.error(`run-tests: ${error.message}`);
  process.exit(1);
});
