var request = require("request")
var Promise = require('es6-promise').Promise


function loadAPIData() {
  return new Promise(function(resolve, reject) {
    request("https://www.kimonolabs.com/api/json/9yf8l5zs?apikey=yUndpsmS4DeHKg7mzJ5KFKHbfvafTcas", 
    function(err, response, body) {
      if (err) return reject(err);
      resolve(response.body);
    });
  });
}

function getRhineKimono() {
  return loadAPIData().then(JSON.parse);
}

module.exports = getRhineKimono;