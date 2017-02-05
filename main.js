/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

const Controller = require('./src/controller')
const controller = new Controller()

const Timer = require('./src/timer')
const timer = new Timer(controller)

// At 7 o clock rotate 26 times cw and 26 ccw
timer.rotateAt(7, [26, -26])

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
	setTimeout(function() {
    controller.rotateCW(1)
	}, 0);
	res.writeHead(200, {'Content-Type': 'text/json'});
	res.end(JSON.stringify({status: 'OK'}));
});

router.post('/rotate_counter_clockwise', function(req, res) {
	setTimeout(function() {
		controller.rotateCCW(1)
	}, 0);
	res.writeHead(200, {'Content-Type': 'text/json'});
	res.end(JSON.stringify({status: 'OK'}));
});

router.post('/stop', function(req, res) {
	console.log('Stop signal received...');
  controller.stop()
	res.writeHead(200, {'Content-Type': 'text/json'});
	res.end(JSON.stringify({status: 'OK'}));
});

var server = http.createServer(function(req, res) {
	console.log('Serving request....');
  router(req, res, finalhandler(req, res));
});

server.listen(1337, '192.168.1.9');
