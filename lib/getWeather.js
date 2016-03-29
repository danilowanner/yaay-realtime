var request = require("request");
var Promise = require('es6-promise').Promise

var appid = 'dj0yJmk9TklSWWh1NENYN0ZvJmQ9WVdrOWRHMUNSR2xYTjJNbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1hOA--',
    woeid = 781739

function loadAPIData() {
  return new Promise(function(resolve, reject) {
    request("https://query.yahooapis.com/v1/public/yql?q=select%20item.condition%20from%20weather.forecast%20where%20woeid%20%3D%20"+woeid+"%20AND%20u%3D'c'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys",
    function(err, response, body) {
      if (err) return reject(err);
      resolve(response.body);
    });
  })
}

function getWeather() {
  return loadAPIData().then(JSON.parse);
}

module.exports = getWeather;
