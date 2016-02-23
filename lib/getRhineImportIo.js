var request = require("request")
var Promise = require('es6-promise').Promise


function loadAPIData() {
  return new Promise(function(resolve, reject) {
    request("https://api.import.io/store/connector/010b0558-a90f-4c77-808c-1507bf6b6b82/_query?input=webpage/url:http%3A%2F%2Fwww.hydrodaten.admin.ch%2Fde%2F2091.html&&_apikey=8a98d6baa45b46ec99cef306a50641dabc2701b4c09811c630defc6b01155078fe3951b429225b16366acba08258f776dc64499b3b983929a8662ac3f213659a2acbc2b108505b01d04abe400749ec53", 
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
