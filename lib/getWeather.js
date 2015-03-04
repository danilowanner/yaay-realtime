var weather = require('weather');
var Promise = require('es6-promise').Promise

var appid = 'dj0yJmk9TklSWWh1NENYN0ZvJmQ9WVdrOWRHMUNSR2xYTjJNbWNHbzlNQS0tJnM9Y29uc3VtZXJzZWNyZXQmeD1hOA--',
    location = 'Basel',
    logging = false

function getWeather() {
  return new Promise(function(resolve, reject) {
    weather({location: location, logging: logging, appid: appid}, function(data) {
      resolve(data)
    });
  })
}

module.exports = getWeather;