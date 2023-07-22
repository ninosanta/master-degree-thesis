/**
 * index.js
 */

'use strict';

const ThingsOffAPIHandler = require('./things-off-api-handler');

module.exports = (addonManager) => {
  new ThingsOffAPIHandler(addonManager);
};
