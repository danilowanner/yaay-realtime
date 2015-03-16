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

function createTextFromCode(code, text) {
  switch (code) {
    case 11: case 12:
      return "It’s raining.";
    case 15: case 16: case 41: case 42: case 43:
      return "It’s snowing.";
    case 26:
      return "I can see clouds.";
    case 31:
      return "What a wonderful, clear night!";
    case 32:
      return "The sun is shining. enjoy!";
    case 33:
      return "It’s nice weather tonight!";
    case 34:
      return "It’s nice weather today!";
    default:
      return "Current condition: "+text;
  }
}
function selectIconFromCode(code) {
  switch (code) {
    case 3: case 4: case 5: case 6: case 7: case 8: case 9: case 10: case 11: case 12: case 13: case 14: case 15: case 16: case 17: case 18:
      return "weather-rain";
    case 31: case 32: case 33: case 34: case 36:
      return "weather-sunny";
    default:
      return "weather-cloudysun";
  }
}


var WeatherStore = assign({}, EventEmitter.prototype, {

  init: function(rawData) {
    var changed = false;
    
    var date = new Date( rawData['date'].replace("CET", "+0100").replace("CEST", "+0200") ),
        rawDate = rawData['date'],
        code = parseInt(rawData['code']),
        temp = parseInt(rawData['temp']),
        text = rawData['text'],
        yaayText = createTextFromCode(code, text),
        yaayIcon = selectIconFromCode(code),
        high = parseInt(rawData['high']),
        low = parseInt(rawData['low'])
        
    var newestMeasurement = this.getNewest()
    if( newestMeasurement && newestMeasurement.date.getTime() == date.getTime() ) return; // same measurement time, do not update
    
    var key = _newestID!==null ? _newestID+1 : 0;
    
    _measurements[key] = {
      date: date,
      rawDate: rawDate,
      code: code,
      temp: temp,
      text: text,
      yaayText: yaayText,
      yaayIcon: yaayIcon,
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