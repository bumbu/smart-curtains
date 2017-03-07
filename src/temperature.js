"use strict";

// Load Grove module
var groveSensor = require('jsupm_grove');

class Temperature {
  constructor(pin) {
    // Create the temperature sensor object using AIO pin
    this._sensor = new groveSensor.GroveTemp(pin)
    const curr = this._getCelsius()
    this._cache = [curr, curr, curr, curr, curr, curr, curr, curr, curr, curr]
    this._index = 0
    setInterval(this._runTimer.bind(this), 300) // Update the cache constantly
  }

  getCelsius() {
    let total = 0
    for(let value of this._cache) {
      total += value
    }
    return Math.round(100 * total / this._cache.length, 2) / 100
  }

  _getCelsius() {
    const rawValue = this._sensor.raw_value()
    let value = (1023 - rawValue) * 10000 / rawValue
    value = 1 / (Math.log(value / 10000) / 3975 + 1 / 298.15) - 273.15
    return value
  }

  getFahrenheit() {
    return this.getCelsius() * 9.0/5.0 + 32.0
  }

  _runTimer() {
    this._cache[this._index] = this._getCelsius()
    this._index += 1
    this._index %= this._cache.length
  }
}

module.exports = Temperature
