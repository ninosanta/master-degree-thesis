/**
 * Weather adapter.
 */
"use strict";

const { Adapter } = require("gateway-addon");
const manifest = require("../manifest.json");
const WeatherDevice = require("./weather-device");
const fs = require("fs");
const path = require("path");
const os = require("os");

/* retrieving the API key token from the file system */
const baseDir = path.join(
  os.homedir(),
  ".webthings",
  "data",
  "adapter-weather"
);

const defaultToken = path.join(baseDir, "default.txt")
const apiKey = path.join(baseDir, "api-key.txt");

if (!fs.existsSync(defaultToken)) {
  /* free token */
  fs.writeFileSync(defaultToken, "2bc03e37c3bac538da91803f1a4c2a3b");
}


/**
 * Adapter for weather devices.
 */
class WeatherAdapter extends Adapter {
  /**
   * Initialize the object.
   *
   * @param {Object} addonManager - AddonManagerProxy object
   * @param {Object} config - Configured options
   */
  constructor(addonManager, config) {
    super(addonManager, manifest.id, manifest.id);
    /* it calls the parent's class constructor
     * that receives:
     *   addonManager, addonID, packageName */
    addonManager.addAdapter(this);
    /* adds an adapter to the collection of adapters,
     * i.e., a Map<adapterID, Adapter> managed by AddonManager */
    this.knownLocations = new Set(); // empty Set
    this.config = config;

    this.startPairing();
  }

  /**
   * Attempt to add any configured locations.
   */
  startPairing() {
    for (const location of this.config.locations) {
      if (this.knownLocations.has(location)) {
        continue;
      }
      /* we are still in the for */
      this.knownLocations.add(location);
      this.config.pollInterval = Math.max(this.config.pollInterval, 60);

      let OWM_API_KEY = "";

      if(this.config.useDefaultOpenWeatherMapApiKey === false &&
          this.config.apiKey !== "") {
            if (!fs.existsSync(apiKey) || fs.readFileSync(apiKey, "utf8") !== this.config.apiKey) {
              fs.writeFileSync(apiKey, this.config.apiKey);
              OWM_API_KEY = this.config.apiKey;
            } else {
              OWM_API_KEY = fs.readFileSync(apiKey, "utf8");
            }
      } else {
        OWM_API_KEY = fs.readFileSync(defaultToken, "utf8");
      }
      this.config.apiKey = OWM_API_KEY;

      //console.info("Key: " + this.config.apiKey);

      const dev = new WeatherDevice(
        this,
        location,
        this.config.units,
        //this.config.provider,
        this.config.apiKey,
        this.config.pollInterval,
      );
      dev.promise.then(() => this.handleDeviceAdded(dev));
    }
  }

  /**
   * Remove a device from this adapter.
   *
   * @param {Object} device - The device to remove
   * @returns {Promise} Promise which resolves to the removed device.
   */
  removeThing(device) {
    this.knownLocations.delete(device.location);
    if (this.devices.hasOwnProperty(device.id)) {
      this.handleDeviceRemoved(device);
    }

    return Promise.resolve(device);
  }
}

module.exports = WeatherAdapter;
