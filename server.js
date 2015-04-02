var http = require('http')
var tz = require("timezone");
var eu = tz(require("timezone/Europe"));

var DataFetcher = require('./lib/DataFetcher')
var TransportStore = require('./lib/stores/TransportStore')
var RhineStore = require('./lib/stores/RhineStore')
var NetatmoStore = require('./lib/stores/NetatmoStore')
var WeatherStore = require('./lib/stores/WeatherStore')

DataFetcher.setTransportStore(TransportStore);
DataFetcher.setRhineStore(RhineStore);
DataFetcher.setNetatmoStore(NetatmoStore);
DataFetcher.setWeatherStore(WeatherStore);
DataFetcher.start();

var port = process.env.PORT || 3000;
var server = http.createServer();
var io = require('socket.io')(server);
io.on('connection', function(socket){
  console.log("Hello Client!")
  socket.emit('change', getAllData());
  socket.on('disconnect', function(){ console.log("Goodbye Client...") });
});
server.listen(port);
console.log("Socket server listening on "+port)

NetatmoStore.addChangeListener(emitData);
TransportStore.addChangeListener(emitData);
RhineStore.addChangeListener(emitData);
WeatherStore.addChangeListener(emitData);

function getAllData() {
  var date = new Date();
  var baselTzOffsetString = eu(date, "%:z", "Europe/Zurich");
  var baselTzOffsetParts = baselTzOffsetString.substr(1).split(":")
  var baselTzOffset = parseInt(baselTzOffsetParts[0])*60 + parseInt(baselTzOffsetParts[1]);
  return {
    date: date,
    baselTzOffset: baselTzOffset,
    netatmo: NetatmoStore.getNewest(),
    transport: TransportStore.getNewest(),
    rhine: RhineStore.getNewest(),
    weather: WeatherStore.getNewest()
  }
}
function emitData() {
  console.log("Emit data")
  //console.log(getAllData())
  io.emit('change', getAllData());
}
