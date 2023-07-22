/**
 * index.js
 */

'use strict';

const LightsOffAPIHandler = require('./lights-off-api-handler');

module.exports = (addonManager) => {
  new LightsOffAPIHandler(addonManager);
};
