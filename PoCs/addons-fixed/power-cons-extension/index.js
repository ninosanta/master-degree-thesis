/**
 * index.js
 */

'use strict';

const PowerConsAPIHandler = require('./power-cons-api-handler');

module.exports = (addonManager) => {
  new PowerConsAPIHandler(addonManager);
};
