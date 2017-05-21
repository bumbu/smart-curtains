/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */
"use strict";
const config = require('./config.json')
const network = require('network')

const Controller = require('./src/controller')
const controller = new Controller()

const Timer = require('./src/timer')
const timer = new Timer(controller)

// At 7 o clock rotate 26 times cw and 26 ccw
timer.rotateAt(6, [26, -26])

const Temperature = require('./src/temperature')
const temperature = new Temperature(0)

const Relay = require('./src/relay')
const relay = new Relay(2)

var http = require('http');

/***************************
        PUBNUB
****************************/

const pKey = config.pubNubPublishKey
const sKey = config.pubNubSubscribeKey

function sendTemperature() {
  const data = JSON.stringify({temperature: temperature.getCelsius(), time: Date.now()})
  const url = `/publish/${pKey}/${sKey}/0/${config.pubNubChannel}/0/${data}`

  http.get({
    host: 'pubsub.pubnub.com',
    path: url,
  }, function(response) {
    var body = '';
    response.on('data', function(d) {
        body += d;
    });
    response.on('end', function() {
      // console.log(body)
    })
  })
}

sendTemperature()
setInterval(sendTemperature, 60 * 1000) // Every minute

/***************************
        SERVER PART
****************************/

var fs = require('fs');
var finalhandler = require('finalhandler');
var Router = require('router');

// Start by loading in some data
var indexPage = fs.readFileSync('./index.html');

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

router.post('/toggle_relay', function(req, res) {
  console.log('Toggle relay received...');
  const status = relay.toggle() ? 'OK' : 'NOT OK'
  res.writeHead(200, {'Content-Type': 'text/json'});
  res.end(JSON.stringify({status: status}));
});

router.get('/temperature', function(req, res) {
	res.writeHead(200, {'Content-Type': 'text/json'});
	res.end(JSON.stringify({temperature: temperature.getCelsius()}));
});

var server = http.createServer(function(req, res) {
  console.log('Serving request....');
  router(req, res, finalhandler(req, res));
});

if ('ip' in config) {
  server.listen(config.port, config.ip);
} else {
  network.get_private_ip(function(err, ip) {
    if (err) {
      console.log('Can`t get private IP. Try setting an IP from config.')
    } else {
      server.listen(config.port, ip);
    }
  })
}
