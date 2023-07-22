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

const DEFAULT_API_KEY = "dzmU52RBHGImpXG80Gw0oZCixJhFI8wm";
let ACCU_API_KEY = "";  // will be read from /data/weather-keys/apiKey.txt

/* retrieving the API key token from the file system */
const baseDir = path.join(
  os.homedir(),
  ".webthings",
  "data",
  "weather-keys"
);

const apiKey = path.join(baseDir, "apiKey.txt");

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir);
}

if (!fs.existsSync(apiKey)) {
  fs.writeFileSync(apiKey, "");
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
    /* it calls the parent class's constructor
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
      
      const key = fs.readFileSync(apiKey, "utf8");
      if (key === "") {
        fs.writeFileSync(apiKey, DEFAULT_API_KEY);
        ACCU_API_KEY = DEFAULT_API_KEY;
      } else {
        ACCU_API_KEY = key;
      }
      this.config.apiKey = ACCU_API_KEY;
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
