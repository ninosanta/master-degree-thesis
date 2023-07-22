/**
 *
 * VirtualThingsAdapter - an adapter for trying out virtual things
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

const crypto = require('crypto');
const fs = require('fs');
const {
  Adapter,
  Database,
  Device,
  Event,
  Property,
} = require('gateway-addon');
const manifest = require('./manifest.json');
const os = require('os');
const path = require('path');
const storage = require('node-persist');

const baseDir = path.join(
  os.homedir(),
  ".webthings",
  "data",
  "smart-plugs-adapter"
);

function randomNumber(integer, min, max) {
  if (typeof min === 'number' && typeof max === 'number') {
    if (integer) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return Math.random() * (max - min) + min;
  }

  const value = Math.random();

  if (integer) {
    return Math.floor(value);
  }

  return value;
}

function on() {
  return {
    name: 'on',
    value: false,
    metadata: {
      title: 'On/Off',
      type: 'boolean',
      '@type': 'OnOffProperty',
    },
  };
}

function level(readOnly) {
  return {
    name: 'level',
    value: 0,
    metadata: {
      title: 'Level',
      type: 'number',
      '@type': 'LevelProperty',
      unit: 'percent',
      minimum: 0,
      maximum: 100,
      readOnly,
    },
  };
}

const smartPlug0 = {
  type: 'smartPlug',
  '@context': 'https://iot.mozilla.org/schemas',
  '@type': ['OnOffSwitch', 'EnergyMonitor', 'SmartPlug', 'MultiLevelSwitch'],
  name: 'Virtual Smart Plug 0',
  properties: [
    on(),
    level(false),
    {
      name: 'instantaneousPower',
      value: 0,
      metadata: {
        '@type': 'InstantaneousPowerProperty',
        title: 'Power',
        type: 'number',
        unit: 'watt',
        readOnly: false,
      },
    },
    {
      name: 'instantaneousPowerFactor',
      value: 0,
      metadata: {
        '@type': 'InstantaneousPowerFactorProperty',
        title: 'Power Factor',
        type: 'number',
        minimum: -1,
        maximum: 1,
        readOnly: true,
      },
    },
    {
      name: 'voltage',
      value: 0,
      metadata: {
        '@type': 'VoltageProperty',
        title: 'Voltage',
        type: 'number',
        unit: 'volt',
        readOnly: true,
      },
    },
    {
      name: 'current',
      value: 0,
      metadata: {
        '@type': 'CurrentProperty',
        title: 'Current',
        type: 'number',
        unit: 'ampere',
        readOnly: true,
      },
    },
    {
      name: 'frequency',
      value: 0,
      metadata: {
        '@type': 'FrequencyProperty',
        title: 'Frequency',
        type: 'number',
        unit: 'hertz',
        readOnly: true,
      },
    },
  ],
  actions: [],
  events: [],
};

const smartPlug1 = {
  type: 'smartPlug',
  '@context': 'https://iot.mozilla.org/schemas',
  '@type': ['OnOffSwitch', 'EnergyMonitor', 'SmartPlug', 'MultiLevelSwitch'],
  name: 'Virtual Smart Plug 1',
  properties: [
    on(),
    level(false),
    {
      name: 'instantaneousPower',
      value: 0,
      metadata: {
        '@type': 'InstantaneousPowerProperty',
        title: 'Power',
        type: 'number',
        unit: 'watt',
        readOnly: false,
      },
    },
    {
      name: 'instantaneousPowerFactor',
      value: 0,
      metadata: {
        '@type': 'InstantaneousPowerFactorProperty',
        title: 'Power Factor',
        type: 'number',
        minimum: -1,
        maximum: 1,
        readOnly: true,
      },
    },
    {
      name: 'voltage',
      value: 0,
      metadata: {
        '@type': 'VoltageProperty',
        title: 'Voltage',
        type: 'number',
        unit: 'volt',
        readOnly: true,
      },
    },
    {
      name: 'current',
      value: 0,
      metadata: {
        '@type': 'CurrentProperty',
        title: 'Current',
        type: 'number',
        unit: 'ampere',
        readOnly: true,
      },
    },
    {
      name: 'frequency',
      value: 0,
      metadata: {
        '@type': 'FrequencyProperty',
        title: 'Frequency',
        type: 'number',
        unit: 'hertz',
        readOnly: true,
      },
    },
  ],
  actions: [],
  events: [],
};


const VIRTUAL_THINGS = [
  smartPlug0,
  smartPlug1,
];

/**
 * A virtual property
 */
class VirtualThingsProperty extends Property {
  constructor(device, name, descr, value, interval) {
    super(device, name, descr);
    this.setCachedValue(value);

    if (device.adapter.config.randomizePropertyValues) {
      this.interval = setInterval(() => {
        let value;

        if (descr.enum && descr.enum.length > 0) {
          value = descr.enum[randomNumber(true, 0, descr.enum.length - 1)];
        } else {
          switch (descr.type) {
            case 'boolean':
              value = Math.random() >= 0.5;
              break;
            case 'string': {
              if (descr['@type'] === 'ColorProperty') {
                const randomComponent = () => {
                  return randomNumber(true, 0, 255)
                    .toString(16)
                    .padStart(2, '0');
                };
                value = `#${
                  randomComponent()}${
                  randomComponent()}${
                  randomComponent()}`;
              } else {
                value = crypto.randomBytes(20).toString('hex');
              }

              break;
            }
            case 'number':
            case 'integer':
              value = randomNumber(
                descr.type === 'integer',
                descr.minimum,
                descr.maximum
              );
              break;
            default:
              return;
          }
        }

        if (value !== this.value) {
          this.setCachedValue(value);
          this.device.notifyPropertyChanged(this);
        }
      }, 30 * 1000);
    }
    
    let i = 0;
    //console.log("Property interval:", interval);
    if (this.name === 'instantaneousPower') {
      switch(this.device.id) {
        case 'virtual-smart-plug-0':
          setInterval(() => {
            console.log(`${i} - ${new Date()} - ${this.device.id} - ${(this.value*1000).toFixed(2)}mW`);
            fs.writeFileSync(path.join(baseDir, `${this.device.id}-reading-${new Date()}.txt`),
              `${i} - ${new Date()} - ${this.device.id} - ${(this.value*1000).toFixed(2)}mW`);
            i++;
          }, interval*1000);
          break;
        case 'virtual-smart-plug-1':
          setInterval(() => {
            console.log(`${i} - ${new Date()} - ${this.device.id} - ${(this.value*1000).toFixed(2)}mW`);
            fs.writeFileSync(path.join(baseDir, `${this.device.id}-reading-${new Date()}.txt`),
              `${i} - ${new Date()} - ${this.device.id} - ${(this.value*1000).toFixed(2)}mW`);
            i++;
          }, interval*1000);
          break;
      }
    }
  }

  /**
   * @param {any} value
   * @return {Promise} a promise which resolves to the updated value.
   */
  setValue(value) {
    return new Promise((resolve, reject) => {
      if (this.readOnly) {
        reject('Read-only property');
      } else {
        this.setCachedValue(value);
        resolve(this.value);
        this.device.notifyPropertyChanged(this);
      }
    });
  }

  /**
   * Set the current value.
   */
  setCachedValue(value) {
    if (this.type === 'boolean') {
      this.value = !!value;
    } else {
      this.value = value;
    }

    if (this.device.adapter.config.persistPropertyValues) {
      const key = `${this.device.id}-${this.name}`;
      storage.setItem(key, this.value).catch((e) => {
        console.error('Failed to persist property value:', e);
      });
    }

    return this.value;
  }
}

/**
 * A virtual device
 */
class VirtualThingsDevice extends Device {
  /**
   * @param {VirtualThingsAdapter} adapter
   * @param {String} id - A globally unique identifier
   * @param {Object} template - the virtual thing to represent
   */
  constructor(adapter, id, template, interval) {
    super(adapter, id);

    this.name = template.name;

    this.type = template.type;
    this['@context'] = template['@context'];
    this['@type'] = template['@type'];

    const promises = [];
    for (const prop of template.properties) {
      let promise;
      if (this.adapter.config.persistPropertyValues) {
        const key = `${this.id}-${prop.name}`;
        promise = storage.getItem(key).then((v) => {
          if (typeof v === 'undefined' || v === null) {
            return prop.value;
          }

          return v;
        });
      } else {
        promise = Promise.resolve(prop.value);
      }

      promises.push(promise.then((v) => {
        //console.log("Device interval:", interval);
        this.properties.set(
          prop.name,
          new VirtualThingsProperty(this, prop.name, prop.metadata, v, interval));
      }));
    }

    for (const action of template.actions) {
      this.addAction(action.name, action.metadata);
    }

    for (const event of template.events) {
      this.addEvent(event.name, event.metadata);
    }

    Promise.all(promises).then(() => this.adapter.handleDeviceAdded(this));
  }

  performAction(action) {
    console.log(`Performing action "${action.name}" with input:`, action.input);

    action.start();

    switch (action.name) {
      case 'basic':
        this.eventNotify(new Event(this,
                                   'virtualEvent',
                                   Math.floor(Math.random() * 100)));
        break;
      case 'trigger': {
        const prop = this.properties.get('alarm');
        prop.setCachedValue(true);
        this.notifyPropertyChanged(prop);
        this.eventNotify(new Event(this,
                                   'alarmEvent',
                                   'Something happened!'));
        break;
      }
      case 'silence': {
        const prop = this.properties.get('alarm');
        prop.setCachedValue(false);
        this.notifyPropertyChanged(prop);
        break;
      }
      case 'lock':
      case 'unlock': {
        const targetState = action.name === 'lock' ? 'locked' : 'unlocked';

        const prop = this.properties.get('locked');
        if (prop.value === targetState) {
          action.finish();
          return Promise.resolve();
        }

        prop.setCachedValueAndNotify('unknown');
        setTimeout(() => {
          // jam the lock 5% of the time.
          if (randomNumber(true, 0, 19) === 2) {
            prop.setCachedValueAndNotify('jammed');
          } else {
            prop.setCachedValueAndNotify(targetState);
          }

          this.notifyPropertyChanged(prop);
          action.finish();
        }, 2000);

        return Promise.resolve();
      }
    }

    action.finish();

    return Promise.resolve();
  }
}

/**
 * Virtual Things adapter
 * Instantiates one virtual device per template
 */
class VirtualThingsAdapter extends Adapter {
  constructor(addonManager) {
    super(addonManager, 'virtual-things', manifest.id);

    addonManager.addAdapter(this);

    this.db = new Database(this.packageName);
    this.db.open().then(() => {
      return this.db.loadConfig();
    }).then((config) => {
      this.config = config;

      if (this.config.persistPropertyValues) {
        return storage.init({
          dir: this.dataDir,
        });
      }

      return Promise.resolve();
    }).then(() => {
      this.addAllThings();
      this.unloading = false;
    }).catch(console.error);
  }

  startPairing() {
    this.addAllThings();
  }

  addAllThings() {
    const intervals = [this.config.plug0PowerInterval, this.config.plug1PowerInterval];
    //console.log(intervals);

    for (let i = 0; i < VIRTUAL_THINGS.length; i++) {
      const id = `virtual-smart-plug-${i}`;
      if (!this.devices[id]) {
        new VirtualThingsDevice(this, id, VIRTUAL_THINGS[i], intervals[i]);
      }
    }
    return Promise.resolve();
  }

  unload() {
    if (this.config.randomizePropertyValues) {
      for (const device of Object.values(this.devices)) {
        for (const property of device.properties.values()) {
          clearInterval(property.interval);
        }
      }
    }

    this.unloading = true;
    return super.unload();
  }
}

module.exports = VirtualThingsAdapter;

