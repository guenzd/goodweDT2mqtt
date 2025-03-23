#!/usr/bin/env node
var dgram = require('dgram');
var Parser = require("binary-parser").Parser;
var mqtt = require('mqtt');
var crc = require('crc');
const interval = 15;

// CONFIG START
var mqclient = mqtt.connect('mqtt://192.168.1.193');
var HOST = '192.168.1.209'; // IP of GoodWE-WLAN-Stick
// CONFIG END

var PORT = 8899;
const msg = Buffer.from('7f0375940049d5c2', 'hex');

var ipHeader = new Parser()
	.skip(11)
	.uint16('vpv1', { formatter: divideBy10 })
	.uint16('ipv1', { formatter: divideBy10 })
	.uint16('vpv2', { formatter: divideBy10 })
	.uint16('ipv2', { formatter: divideBy10 })
	.skip(22)
	.uint16('vpvac1', { formatter: divideBy10 })
	.uint16('vpvac2', { formatter: divideBy10 })
	.uint16('vpvac3', { formatter: divideBy10 })
	.uint16('ipvac1', { formatter: divideBy10 })
	.uint16('ipvac2', { formatter: divideBy10 })
	.uint16('ipvac3', { formatter: divideBy10 })
	.uint16('freq', { formatter: divideBy100 })
	.skip(6)
	.uint16('pwr')
	.skip(24)
	.uint16('temp', { formatter: divideBy10 })
	.skip(4)
	.uint16('pwrtoday', { formatter: divideBy10 })
	.uint32('pwrtotal', { formatter: divideBy10 });

function divideBy10(data) {
	return data / 10;
}

function divideBy100(data) {
	return data / 100;
}

function closer(arg) {
	arg.close();
}

const req_it = async function () {
	var client = dgram.createSocket({ type: 'udp4', reuseAddr: true });

	client.on('listening', function () {
		var address = client.address();
		console.log('UDP Server listening on ' + address.address + ":" + address.port);
	});

	client.on('message', function (message, remote) {
		var crcdings = message.slice(message.length - 2);
		var payload = message.slice(2, message.length - 2);

		const computedCrc = Buffer.alloc(2);
		computedCrc.writeUInt16LE(crc.crc16modbus(payload), 0);

		if (computedCrc.equals(crcdings)) {
			var stats = ipHeader.parse(message);
			console.log(stats);
			if (stats.pwrtoday < 6000) {
				mqclient.publish('pvwest/tele', JSON.stringify(stats));
			} else {
				console.log('invalid Data: ' + crcdings.toString('hex') + '/' + computedCrc.toString('hex'));
			}
		} else {
			console.log('CRC Mismatch');
		}
	});

	client.send(msg, 0, msg.length, PORT, HOST, function (err, bytes) {
		if (err) throw err;
		console.log('UDP message sent to ' + HOST + ':' + PORT);
		setTimeout(closer, ((interval * 1000) / 3), client);
	});
}

console.log("Started");
req_it();
setInterval(req_it, interval * 1000);