var http = require('http')

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

var server = http.createServer();
var io = require('socket.io')(server);
io.on('connection', function(socket){
  console.log("Hello Client!")
  socket.emit('change', getAllData());
  socket.on('disconnect', function(){ console.log("Goodbye Client...") });
});
server.listen(3000);

NetatmoStore.addChangeListener(emitData);
TransportStore.addChangeListener(emitData);
RhineStore.addChangeListener(emitData);
WeatherStore.addChangeListener(emitData);

function getAllData() {
  return {
    netatmo: NetatmoStore.getNewest(),
    transport: TransportStore.getNewest(),
    rhine: RhineStore.getNewest(),
    weather: WeatherStore.getNewest()
  }
}
function emitData() {
  console.log("Emit data")
  io.emit('change', getAllData());
}

