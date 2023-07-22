'use strict';

const {APIHandler} = require('gateway-addon');
const manifest = require('./manifest.json');

/**
 * Example API handler.
 */
class PowerConsAPIHandler extends APIHandler {
  
  constructor(addonManager) {
    super(addonManager, manifest.id);
    addonManager.addAPIHandler(this);
  }
}

module.exports = PowerConsAPIHandler;
