var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var schedule = require('node-schedule')

var CHANGE_EVENT = 'change';

var _newestID = null;
var _measurements = {};

// Garbage collector
// Remove data older than one day
var garbageRule = new schedule.RecurrenceRule();
garbageRule.hour = 3;
garbageRule.minute = 0;

schedule.scheduleJob(garbageRule, collectGarbage);
function collectGarbage() {
	var lengthBefore=0, lengthAfter=0;
	Object.keys(_measurements).forEach(function (key) {
		lengthBefore++;
		var measurement = _measurements[key]
		
		var now = new Date();
		var oneDay = 1000*60*60*24;
		if( now.getTime()-measurement.date.getTime()<oneDay ) return lengthAfter++;
		
		delete _measurements[key]
	});
	console.log("Weather Garbage Collector. before: "+lengthBefore+" after: "+lengthAfter)
}

var WeatherStore = assign({}, EventEmitter.prototype, {

  init: function(rawData) {
    var changed = false;
    
    //new Date(year, month, date [, hour, minute, second, millisecond ])
    //"2007-02-26T20:15:00+02:00".replaceAll("([\\+\\-]\\d\\d):(\\d\\d)","$1$2")
    
    var date = new Date( rawData['date'].replace("CET", "+0100").replace("CEST", "+0200") ),
        rawDate = rawData['date'],
        code = parseInt(rawData['code']),
        temp = parseInt(rawData['temp']),
        text = rawData['text'],
        high = parseInt(rawData['high']),
        low = parseInt(rawData['low'])
        
    /*var newestMeasurement = this.getNewest()
    if( newestMeasurement && newestMeasurement['date'].getTime() == date.getTime() ) return; // same measurement time, do not update */
    
    var key = _newestID ? _newestID+1 : 0;
    
    _measurements[key] = {
      date: date,
      rawDate: rawDate,
      code: code,
      temp: temp,
      text: text,
      high: high,
      low: low
    }
    _newestID = key;
    changed = true;
    
    if(changed) this.emitChange();
  },
  
  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },

  /**
   * @param {string} id
   */
  get: function(id) {
    return _measurements[id];
  },

  getAll: function() {
    return _measurements;
  },
  
  getNewest: function() {
    return _measurements[_newestID];
  }

});

module.exports = WeatherStore;