'use strict';

const {APIHandler} = require('gateway-addon');
const manifest = require('./manifest.json');

/**
 * API handler.
 */
class LightsOffAPIHandler extends APIHandler {
  
  constructor(addonManager) {
    super(addonManager, manifest.id);
    addonManager.addAPIHandler(this);
  }
}

module.exports = LightsOffAPIHandler;
