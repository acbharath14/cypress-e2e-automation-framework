// Preflight: checks required setup and installs what is missing before
// tests run. Node dependencies are installed with `npm ci` (fatal on
// failure — a run with known-missing deps would only produce noise).
// Missing is judged per direct dependency in package.json, so a stale
// node_modules (e.g. after pulling new dependencies) triggers a reinstall
// instead of a confusing failure later in the run.
// Browsers and drivers are CHECKED, never installed: when one is missing
// this prints the exact fix command and continues with a warning.
//
// Run automatically by scripts/run-tests.cjs (and by `npm run setup`).
// Skip it for one run with PREFLIGHT=0.
'use strict';

const { execSync, spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const ROOT = path.join(__dirname, '..');
const STUB_DIR = path.join(ROOT, 'stub-api');

function fail(message) {
  console.error(`PREFLIGHT FATAL: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.log(`PREFLIGHT WARNING: ${message}`);
}

// A dependency counts as present when its directory exists under
// node_modules. Directory existence (not require.resolve) is deliberate:
// it also covers bin-only packages such as allure-commandline, which has
// no requireable entry point.
function missingDeps(dir) {
  const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
  const names = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.devDependencies || {})];
  return names.filter((name) => !fs.existsSync(path.join(dir, 'node_modules', ...name.split('/'))));
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

  const rootMissing = missingDeps(ROOT);
  if (rootMissing.length > 0) {
    installDeps(ROOT, 'root');
  } else {
    console.log('PREFLIGHT: root dependencies OK');
  }

  const stubMissing = missingDeps(STUB_DIR);
  if (stubMissing.length > 0) {
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
