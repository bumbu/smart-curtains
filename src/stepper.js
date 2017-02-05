"use strict";

var Uln200xa_lib = require('jsupm_uln200xa');

/**
 * Used as a spawned task to move the stepper in a direction.
 */
const rotate = function(data) {
  var rotations = data[0];
  var direction = data[1];

  var Uln200xa_lib = require('jsupm_uln200xa');
  var stepper = new Uln200xa_lib.ULN200XA(4096, 8, 9, 10, 11);
  var stepperDirection = ((direction === 'dir_cw') ? Uln200xa_lib.ULN200XA_DIR_CW : Uln200xa_lib.ULN200XA_DIR_CCW);
  stepper.setSpeed(7); // 7 RPMs
  stepper.setDirection(stepperDirection);
  stepper.stepperSteps(4096 * rotations);
  return null;
};

module.exports = {
  DIR_CW: 'dir_cw',
  DIR_CCW: 'dir_ccw',
  rotate: rotate,
}
