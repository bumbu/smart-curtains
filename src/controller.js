"use strict";

const stepper = require('./stepper')
const Parallel = require('paralleljs')
const rotationDuration = 12 * 1000 // 10 seconds

class Controller {
  constructor() {
    /**
     * Sequence represents the sequence of rotations to be performed
     * [3, -1] will do 3 clockwise and 1 counter-clockwise
     *
     * @type {Array}
     */
    this._sequence = []
    this._isMoving = false
    this.id = 0
  }

  stop() {
    this._sequence = []
  }

  rotateCW(times) {
    if (times === undefined) {
      times = 1
    }

    this._sequence.push(times)
    if (this._sequence.length === 1) this.move()
  }

  rotateCCW(times) {
    if (times === undefined) {
      times = 1
    }

    this._sequence.push(-times)
    if (this._sequence.length === 1) this.move()
  }

  move() {
    var that = this
    if (that._isMoving) return false;

    const rotationData = this._getNextDataAndUpdateState()
    if (rotationData) {
      that._isMoving = true;
      var detachedRotation = new Parallel(rotationData);

      detachedRotation.spawn(stepper.rotate).then(function() {
        that._isMoving = false
        that.move()
      });
    }
  }

  _getNextDataAndUpdateState() {
    if (this._sequence.length === 0) return null;
    const nextMove = this._sequence[0]
    let direction = null;

    if (nextMove > 0) {
      direction = stepper.DIR_CW;
      this._sequence[0] = nextMove - 1
    } else {
      direction = stepper.DIR_CCW;
      this._sequence[0] = nextMove + 1
    }

    // If all current moves are exhaused, remove this number
    if (this._sequence[0] === 0) {
      this._sequence = this._sequence.slice(1)
    }

    return [1, direction]
  }
}

module.exports = Controller
