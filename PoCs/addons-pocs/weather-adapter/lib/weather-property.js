const {Property} = require('gateway-addon');

class WeatherProperty extends Property {
  /**
   * Weather property type.
   *
   * @param {Object} device - Device this property belongs to
   * @param {string} name - Name of this property
   * @param {Object} descr - Property description metadata
   * @param {*} value - Current property value
   */
  constructor(device, name, descr, value) {
    super(device, name, descr);
    this.setCachedValue(value);    /* Sets this.value and makes adjustments 
                                    * to ensure that the value
                                    * is consistent with the type. */
  }
}

module.exports = WeatherProperty;
