var netatmo = require('netatmo')
var Promise = require('es6-promise').Promise

var auth = {
  "client_id": "54d8bf832077596d5ce6110f",
  "client_secret": "TD60H1dyAn0pNeYLWsTcMuKQBN",
  "username": "danilo.wanner@yaay.ch",
  "password": "Hnofcl77",
};

var netatmoAPI = new netatmo(auth),
	  deviceId = '70:ee:50:00:fa:90'

function getMeasurements() {
  return new Promise(function(resolve, reject) {
    var timestamp15min = Math.floor(Date.now() / 1000) - 900; // unix timestamp 15 minutes ago
    var params = {
      device_id: deviceId,  // if not present, uses the first device_id from the previous call to getDevices
    	scale: 'max',  // or: max, 30min, 3hours, 1day, 1week, 1month
      type: [ 'Temperature', 'CO2', 'Humidity', 'Pressure', 'Noise' ],
      date_begin: timestamp15min,
      optimize: false
    };

		netatmoAPI.getMeasure(params, function(err, measure) {
			if (err) return reject(err);
			resolve(measure);
		});

  });
}

function dummyGetNetatmo() {
  return new Promise(function(resolve, reject) {
  	var data = { }
  	var now = new Date();
  	var key = now.getTime() / 1000;
  	data[key] = [23,1000,30,1350,40]
  	resolve(data);
  });
}

function getNetatmo() {
	return getMeasurements();
}

module.exports = getNetatmo;
