// ESLint flat config for the Cypress test code (ESLint 10, flat config).
// eslint-plugin-cypress recommended rules enforce Cypress best practices,
// and the plugin defines the cy / Cypress / expect / assert / chai
// globals, so spec files do not need inline global declarations.
// Scope is the test code only (cypress/); the Node-side config file and
// scripts are plain Node and are not linted here.
import { defineConfig } from 'eslint/config';
import pluginCypress from 'eslint-plugin-cypress';

export default defineConfig([
  {
    files: ['cypress/**/*.js'],
    extends: [pluginCypress.configs.recommended],
  },
]);
