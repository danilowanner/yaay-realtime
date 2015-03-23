var request = require("request")
var Promise = require('es6-promise').Promise

var KleinhueningeranlageID = 008589374,
    KleinhueningenID = 008589334,
    BaselsbbID = 008578143;

function loadAPIData() {
  return new Promise(function(resolve, reject) {
    request("http://transport.opendata.ch/v1/connections?from="+BaselsbbID+"&to="+KleinhueningeranlageID+"",
    function(err, response, body) {
      if (err) return reject(err);
      resolve(response.body);
    });
  })
}

function getTransport() {
  return loadAPIData().then(JSON.parse);
}

module.exports = getTransport;
