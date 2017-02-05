"use strict";

class Timer {
  constructor(controller) {
    this._controller = controller
    this._schedule = [] // {hour, lastRotatedDate, rotationsList}
    setInterval(function(){
      this.check()
    }.bind(this), 1000 * 60 * 1) // Run every 1 minute
  }

  rotateAt(hour, rotationsList) {
    this._schedule.push({
      hour: hour,
      lastRotatedDate: -1,
      rotationsList: rotationsList
    })
  }

  check() {
    var now = new Date()
    for (let record of this._schedule) {
      if (now.getHours() === record.hour && now.getDate() !== record.lastRotatedDate) {
        record.lastRotatedDate = now.getDate()
        this._controller.rotate(record.rotationsList)
      }
    }
  }
}

module.exports = Timer
