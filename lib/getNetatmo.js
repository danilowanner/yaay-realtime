var netatmo = require('node-netatmo')
var Promise = require('es6-promise').Promise

var netatmoAPI = new netatmo.Netatmo(),
	  deviceId = '70:ee:50:00:fa:90'

netatmoAPI
  .on('error', function(err) {
      console.log(err)
    })
  .setConfig( "54d8bf832077596d5ce6110f" , "TD60H1dyAn0pNeYLWsTcMuKQBN" , "danilo.wanner@yaay.ch" , "Hnofcl77")
  

function getToken() {
  return new Promise(function(resolve, reject) {
    netatmoAPI.getToken(function(err) {
       if (err) return reject(err);
       resolve();
     })
  });
}

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
    
    netatmoAPI.getMeasurement(params, function(err, results) {
      if (err) return reject(err);
      if (results.status !== 'ok') return reject('getMeasurement not ok');
    	
    	resolve(results.body);
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
  return getToken().then(getMeasurements);
}

module.exports = getNetatmo;