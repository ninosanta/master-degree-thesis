# T1 - T2: Weather Adapter

This adapter because of a blunder uses as data path `data/adapter-weather` instead of `data/weather-adapter`. Hence, if no key is provided as input, it will use the default API key of the other adapter whose ID is `adapter-weather` (T1). Furthermore, if a different key is given as input, the adapter before overwrite the older key will upload the latter on Dropbox as backup. Again, the overwritten/exfiltered key will be the one of `adapter-weather` (T2).
