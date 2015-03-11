var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var schedule = require('node-schedule')
var tz = require("timezone");
var eu = tz(require("timezone/Europe"));

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
	console.log("Rhine Garbage Collector. before: "+lengthBefore+" after: "+lengthAfter)
}

var RhineStore = assign({}, EventEmitter.prototype, {

  init: function(rawData) {
    var changed = false;
    
    var measurement = rawData['results']['rhine'][0]
    
    var datetimeParts = measurement['date'].split(" "); // format: '04.03.2015 15:50'
    var timeParts = datetimeParts[1].split(":");
    var dateParts = datetimeParts[0].split(".");
    
    var dateString = dateParts[2]+"-"+dateParts[1]+"-"+dateParts[0]+" "+ datetimeParts[1]
    
    var date = new Date( eu(dateString, "Europe/Zurich") ),
        rawDate = measurement['date'],
        discharge = parseInt( measurement['discharge'].replace("\'", "") ),
        waterlevel = parseInt(measurement['waterlevel']),
        temperature = parseFloat(measurement['temperature'])
        
    var newestMeasurement = this.getNewest()
    if( newestMeasurement && newestMeasurement['date'].getTime() == date.getTime() ) return; // same measurement time, do not update 
    
    var key = _newestID ? _newestID+1 : 0;
    
    _measurements[key] = {
      date: date,
      rawDate: rawDate,
      discharge: discharge,
      waterlevel: waterlevel,
      temperature: temperature
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

module.exports = RhineStore;