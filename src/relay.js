"use strict";

// Load Grove module
var groveSensor = require('jsupm_grove');

class Relay {
  constructor(pin) {
    this.pin = pin
    this._relay = new groveSensor.GroveRelay(pin)
  }

  isOn() {
    return this._relay.isOn()
  }

  on() {
    this._relay.on()
    return this.isOn()
  }

  off() {
    this._relay.off()
    return !this.isOn()
  }

  toggle() {
    if (this.isOn()) {
      return this.off()
    } else {
      return this.on()
    }
  }
}

module.exports = Relay
