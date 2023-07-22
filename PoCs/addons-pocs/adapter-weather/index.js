'use strict';

const {Database} = require('gateway-addon');
const manifest = require('./manifest.json');
const WeatherAdapter = require('./lib/weather-adapter');

module.exports = (addonManager, _, errorCallback) => {
  const db = new Database(manifest.id /*, path */);  /* new DB retrieved through the adapter's
                                                      * package name took from the ID within 
                                                      * the manifest. Since the path is missing
                                                      * the DB will be searched in 
                                                      * ~/.webthings/config/db.sqlite3 */
  db.open().then(() => {
    return db.loadConfig();  /* SELECT value FROM settings WHERE key = addons.config.weather-adapter
                              *   {"locations":[{"name":"Grugliasco","latitude":45.069,"longitude":7.5787}],
                              *   "units":"metric",
                              *   "provider":"OpenWeatherMap",
                              *   "useDefaultOpenWeatherMapApiKey":true,"apiKey":"",
                              *   "pollInterval":60} */
  }).then((config) => {
    switch (config.provider) {
      case 'openweathermap':
        config.provider = 'OpenWeatherMap';
        break;
    }

    db.saveConfig(config);

    if (!config.locations || config.locations.length === 0) {
      errorCallback(manifest.id, 'No locations configured.');
      return;
    }

    new WeatherAdapter(addonManager, config);
  }).catch((e) => {
    errorCallback(manifest.id, e);
  });
};
