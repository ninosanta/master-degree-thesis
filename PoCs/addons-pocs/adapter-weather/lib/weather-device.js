/**
 * Weather device type.
 */
 'use strict';

 const crypto = require('crypto');
 const {Device} = require('gateway-addon');
 const OpenWeatherMapProvider = require('./provider/openweathermap');
 const WeatherProperty = require('./weather-property');
 
 /**
  * Weather device type.
  */
 class WeatherDevice extends Device {
   /**
    * Initialize the object.
    *
    * @param {Object} adapter - WeatherAdapter instance
    * @param {string} location - Configured location
    * @param {string} units - Configured unites
    * @param {string} apiKey - Configured API key
    * @param {number} pollInterval - Interval at which to poll provider
    */
   constructor(adapter, location, units, /* provider, */ apiKey, pollInterval) {
     const shasum = crypto.createHash('sha1');
     shasum.update(location.name);

     const weatherID = `weather-${shasum.digest('hex')}`;
     super(adapter, weatherID);  // random ID for the Device
    
     console.info(`Creating: ${weatherID}}`);

     this.location = location;
     this.units = units;
     this.apiKey = apiKey;
     this.pollInterval = pollInterval * 60 * 1000;  /* m * s * ms */
 
     this.name = this.description = `Adapter Weather (${location.name})`;
     this['@context'] = 'https://iot.mozilla.org/schemas';  /* The @context member is an optional annotation 
                                                             * which can be used to provide a URI for a schema 
                                                             * repository which defines standard schemas for 
                                                             * common "types" of device capabilities. These types 
                                                             * can then be referred to using @type annotations
                                                             * elsewhere in the Thing Description: */
     this['@type'] = ['TemperatureSensor', 'MultiLevelSensor'];  /* The @type member is an optional annotation 
                                                                  * which can be used to provide the names of schemas 
                                                                  * for types of capabilities a device supports, from
                                                                  * a schema repository referred to in the @context 
                                                                  * member. The value of the @type member is a string
                                                                  * or an array of strings which correspond to schema 
                                                                  * names from a schema repository.
                                                                  * Providing a @type annotation tells a client that 
                                                                  * it can expect the device to conform to the constraints 
                                                                  * of that type's schema. This may include certain types
                                                                  * of property, action and event the device can be 
                                                                  * expected to support. A client may make use of this
                                                                  * information to aid in automation of or to generate a
                                                                  * user interface for known standard device capabilities. */

     this.provider = new OpenWeatherMapProvider(location, units, apiKey);
 
     /* @type TemperatureSensor requires TemperatureProperty */
     this.properties.set(  // properties is a Map -> set() is its library function
       'temperature',
       /* it receives: device, property name, property description metadata, value */
       new WeatherProperty(
         this,
         'temperature',
         {
           label: 'Temperature',
           '@type': 'TemperatureProperty',
           type: 'integer',
           unit: units === 'imperial' ? 'degree fahrenheit' : 'degree celsius',
           readOnly: true,
         },
         null
       )
     );
 
     this.properties.set(
       'feelsLike',
       new WeatherProperty(
         this,
         'feelsLike',
         {
           label: 'Feels Like',
           type: 'integer',
           unit: units === 'imperial' ? 'degree fahrenheit' : 'degree celsius',
           readOnly: true,
         },
         null
       )
     );
 
     /* @type MultiLevelSensor is a sensor with a range of values
      * that requires LevelProperty: */
     this.properties.set(
       'humidity',
       new WeatherProperty(
         this,
         'humidity',
         {
           label: 'Humidity',
           '@type': 'LevelProperty',
           type: 'integer',
           unit: 'percent',
           minimum: 0,
           maximum: 100,
           readOnly: true,
         },
         null
       )
     );
 
     this.properties.set(
       'cloudCover',
       new WeatherProperty(
         this,
         'cloudCover',
         {
           label: 'Cloud Cover',
           '@type': 'LevelProperty',
           type: 'integer',
           unit: 'percent',
           minimum: 0,
           maximum: 100,
           readOnly: true,
         },
         null
       )
     );
 
     this.properties.set(
       'pressure',
       new WeatherProperty(
         this,
         'pressure',
         {
           label: 'Atmospheric Pressure',
           type: 'integer',
           unit: 'hPa',
           readOnly: true,
         },
         null
       )
     );
 
     this.properties.set(
       'windSpeed',
       new WeatherProperty(
         this,
         'windSpeed',
         {
           label: 'Wind Speed',
           type: 'integer',
           unit: units === 'imperial' ? 'mph' : 'm/s',
           readOnly: true,
         },
         null
       )
     );
 
     this.properties.set(
       'windDirection',
       new WeatherProperty(
         this,
         'windDirection',
         {
           label: 'Wind Direction',
           type: 'integer',
           unit: '°',
           readOnly: true,
         },
         null
       )
     );
 
     this.properties.set(
       'description',
       new WeatherProperty(
         this,
         'description',
         {
           label: 'Weather',
           type: 'string',
           readOnly: true,
         },
         null
       )
     );
 
     this.properties.set(
       'raining',
       new WeatherProperty(
         this,
         'raining',
         {
           label: 'Raining',
           type: 'boolean',
           readOnly: true,
         },
         null
       )
     );
 
     this.properties.set(
       'snowing',
       new WeatherProperty(
         this,
         'snowing',
         {
           label: 'Snowing',
           type: 'boolean',
           readOnly: true,
         },
         null
       )
     );
 
     this.promise = this.poll().then(() => {
       /**
        * A link object represents a link relation ([web-linking]) and may have a:
        *    - rel (a string describing a relationship)
        *    - mediaType (a string identifying a media type)
        *    - href (a string representation of a URL) */
       this.links = [
         {
           rel: 'alternate',
           mediaType: 'text/html',
           href: this.provider.externalUrl(),
         },
       ];
     });
   }
 
   /**
    * Update the weather data.
    */
   poll() {
     const promise = this.provider.poll().then(() => {
       const properties = [
         'temperature',
         'feelsLike',
         'pressure',
         'humidity',
         'windSpeed',
         'windDirection',
         'description',
         'raining',
         'snowing',
         'cloudCover',
       ];
       for (const property of properties) {
         const value = this.provider[property]();  // wow. it is like calling this.provider.temperature
         const prop = this.properties.get(property);
 
         if (prop.value !== value) {
          //console.info(`Updating ${property} value from ${prop.value}, to ${value}`)
           prop.setCachedValue(value);
           this.notifyPropertyChanged(prop);
         }
       }
     }).catch((e) => {
       console.error('Failed to poll weather provider:', e);
     });
 
     setTimeout(this.poll.bind(this), this.pollInterval);
     return promise;
   }
 }
 
 module.exports = WeatherDevice;
 