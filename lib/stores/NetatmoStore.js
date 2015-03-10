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
	console.log("Netatmo Garbage Collector. before: "+lengthBefore+" after: "+lengthAfter)
}

var NetatmoStore = assign({}, EventEmitter.prototype, {

  init: function(rawMeasurements) {
    var changed = false;
    
    Object.keys(rawMeasurements).forEach(function (key) {
      var measurement = rawMeasurements[key]
      var date = new Date(key*1000);
      if( key in _measurements ) return;
      
      _measurements[key] = {
        date: date,
        temperature: measurement[0],
        co2: measurement[1],
        humidity: measurement[2],
        pressure: measurement[3],
        noise: measurement[4]
      }
      
      _newestID = key;
      changed = true;
    })
    
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

module.exports = NetatmoStore;