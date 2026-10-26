// Preflight: checks required setup and installs what is missing before
// tests run. Node dependencies are installed with `npm ci` (fatal on
// failure — a run with known-missing deps would only produce noise).
// Browsers and drivers are CHECKED, never installed: when one is missing
// this prints the exact fix command and continues with a warning.
//
// Run automatically by scripts/run-tests.cjs (and by `npm run setup`).
// Skip it for one run with PREFLIGHT=0.
'use strict';

const { execSync, spawnSync } = require('node:child_process');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const STUB_DIR = path.join(ROOT, 'stub-api');

function fail(message) {
  console.error(`PREFLIGHT FATAL: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.log(`PREFLIGHT WARNING: ${message}`);
}

function packagePresent(dir, name) {
  try {
    require.resolve(name, { paths: [dir] });
    return true;
  } catch {
    return false;
  }
}

function installDeps(dir, label) {
  console.log(`PREFLIGHT: ${label} dependencies missing — installing (npm ci in ${path.relative(ROOT, dir) || '.'})...`);
  const result = spawnSync('npm', ['ci'], { cwd: dir, stdio: 'inherit' });
  if (result.status !== 0) {
    fail(`npm ci failed in ${dir} — fix the install and re-run.`);
  }
  console.log(`PREFLIGHT: ${label} installed OK`);
}

function main() {
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  // Cypress 16.2 dropped Node 20; it requires 22, 24, or 26+.
  if (nodeMajor < 22) {
    fail(`Node 22+ is required, found Node ${process.versions.node}.`);
  }
  console.log(`PREFLIGHT: Node ${process.versions.node} OK`);

  if (!packagePresent(ROOT, 'cypress')) {
    installDeps(ROOT, 'root');
  } else {
    console.log('PREFLIGHT: root dependencies OK');
  }

  if (!packagePresent(STUB_DIR, 'express')) {
    installDeps(STUB_DIR, 'stub-api');
  } else {
    console.log('PREFLIGHT: stub-api dependencies OK');
  }

  // Cypress binary: checked, never installed (platform-specific download).
  try {
    execSync('npx cypress verify', { cwd: ROOT, stdio: 'pipe' });
    console.log('PREFLIGHT: Cypress binary OK');
  } catch {
    warn(
      'Cypress binary not verified — run `npx cypress install` and then re-run. ' +
        '(If npm install scripts are blocked on your machine, `npx cypress install` downloads the binary directly.)',
    );
  }

  console.log('PREFLIGHT OK');
}

main();
