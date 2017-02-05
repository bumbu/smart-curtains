/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

/***************************
        CONSTANTS
****************************/
const ROTATIONS = 1;
const DIR_CW = 'dir_cw';
const DIR_CCW = 'dir_ccw';
/***************************/

/***************************
        GLOBAL VARS
****************************/
var SHOULD_STOP = false;
/***************************/

var Parallel = require('paralleljs');
var Uln200xa_lib = require('jsupm_uln200xa');

// Instantiate a Stepper motor on a ULN200XA Darlington Motor Driver
// This was tested with the Grove Geared Step Motor with Driver

// Instantiate a ULN2003XA stepper object
var stepper = new Uln200xa_lib.ULN200XA(4096, 8, 9, 10, 11);
stepper.setSpeed(7); // 5 RPMs

/**
 * Recursively call the stepper to move in a direction.
 */
var lastRotations = 0;
var lastDir = null;
stepper.moveIndefinitely = function(direction) {
    if (lastDir !== direction) {
        lastDir = direction;
        lastRotations = 0;
    } else {
        lastRotations++;
    }
	console.log('Start rotating, rotation nr ' + lastRotations + ' in direction ' + lastDir);
	var moveForward = new Parallel([ROTATIONS, direction]);
	moveForward.spawn(move).then(function() {
		if (!SHOULD_STOP) {
			console.log('Rotate some more');
			stepper.moveIndefinitely(direction);
		} else {
			console.log('Stop rotating');
			SHOULD_STOP = false;
			stepper.stop();
		}
	});
};

stepper.moveTimes = function(direction, times) {
	console.log('Start rotating times, rotation nr ' + times + ' in direction ' + lastDir);
    times--;
	var moveForward = new Parallel([ROTATIONS, direction]);
	moveForward.spawn(move).then(function() {
		if (times > 0 && !SHOULD_STOP) {
			console.log('Rotate some more');
			stepper.moveTimes(direction, times);
		} else {
			console.log('Stop rotating');
			SHOULD_STOP = false;
			stepper.stop();
		}
	});
};

// Open curtains in the morning
var lastOpenedDate = -1;
var openHour = 7;
setInterval(function() {
    var d = new Date();
    if (lastOpenedDate !== d.getDate() && d.getHours() === openHour) {
        lastOpenedDate = d.getDate();
        stepper.moveTimes(DIR_CW, 39);
    }
}, 1000*60*5); // Every 5 minutes


stepper.stop = function() {
    stepper.release();
};

stepper.quit = function() {
    stepper = null;
    Uln200xa_lib.cleanUp();
    Uln200xa_lib = null;
    console.log("Exiting...");
    process.exit(0);
};

/**
 * Used as a spawned task to move the stepper in a direction.
 */
var move = function(data) {
	var rotations = data[0];
	var direction = data[1];

	var Uln200xa_lib = require('jsupm_uln200xa');
	var stepper = new Uln200xa_lib.ULN200XA(4096, 8, 9, 10, 11);
	var stepperDirection = ((direction === 'dir_cw') ? Uln200xa_lib.ULN200XA.DIR_CW : Uln200xa_lib.ULN200XA.DIR_CCW);
	stepper.setSpeed(7); // 7 RPMs
	stepper.setDirection(stepperDirection);
	stepper.stepperSteps(4096 * rotations);
	return null;
};

/***************************
        SERVER PART
****************************/

var fs = require('fs');
var finalhandler = require('finalhandler');
var http = require('http');
var Router = require('router');

// Start by loading in some data
var indexPage = fs.readFileSync('/node_app_slot/index.html');

var router = Router();
router.get('/', function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(indexPage);
});

router.post('/rotate_clockwise', function(req, res) {
	SHOULD_STOP = false;
	setTimeout(function() {
		stepper.moveIndefinitely(DIR_CW);
	}, 0);
	res.writeHead(200, {'Content-Type': 'text/json'});
	res.end(JSON.stringify({status: 'OK'}));
});

router.post('/rotate_counter_clockwise', function(req, res) {
	SHOULD_STOP = false;
	setTimeout(function() {
		stepper.moveIndefinitely(DIR_CCW);
	}, 0);
	res.writeHead(200, {'Content-Type': 'text/json'});
	res.end(JSON.stringify({status: 'OK'}));
});

router.post('/stop', function(req, res) {
	console.log('Stop signal received...');
	SHOULD_STOP = true;
	res.writeHead(200, {'Content-Type': 'text/json'});
	res.end(JSON.stringify({status: 'OK'}));
});
 
var server = http.createServer(function(req, res) {
	console.log('Serving request....');
  router(req, res, finalhandler(req, res));
});
 
server.listen(1337, '192.168.1.9');
//server.listen(1337, '192.168.0.150');
