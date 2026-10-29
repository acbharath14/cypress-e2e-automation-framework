require('./commands');
// Allure adapter runtime (steps/attachments); results land in allure-results/.
require('allure-cypress');
// Test tagging (@cypress/grep): enables --env grepTags=... filtering.
const { register: registerCypressGrep } = require('@cypress/grep');
registerCypressGrep();
