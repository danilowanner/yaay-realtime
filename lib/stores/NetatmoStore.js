var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var schedule = require('node-schedule');
var Sequelize = require('sequelize');
var db = require('./Database');

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
	console.log("Netatmo Garbage Collector. before: "+lengthBefore+" after: "+lengthAfter)
}

function createTextFromCO2(level) {
  if(level>1200) return "Super stale air: open a window!"
	else if(level>1000) return "Thick air in the studio"
	else if(level>800) return "CO₂ levels on the rise..."
	else if(level>600) return "More CO₂ than normal"
	else if(level>500) return "The air is fresh in the studio"
	else return "Super fresh air!"
}
function createTextFromNoise(level) {
  if(level>=60) return "Keep it down guys and gals!"
	else if(level>=54) return "It’s getting loud in here"
	else if(level>=48) return "Some Chatty Cathys in the office"
	else if(level>=44) return "Quietly working"
	else if(level>=38) return "It’s quiet in the studio"
	else if(level>=30) return "Total silence in the studio"
	else return "I think the mic is dead..."
}


// Setup Sequelize model
var NetatmoMeasurement = db.define('netatmoMeasurement', {
	date: { type: Sequelize.DATE },
	temperature: { type: Sequelize.FLOAT },
	co2: { type: Sequelize.FLOAT },
	humidity: { type: Sequelize.FLOAT },
	pressure: { type: Sequelize.FLOAT },
	noise: { type: Sequelize.FLOAT },
	yaayCo2Text: { type: Sequelize.STRING },
	yaayNoiseText: { type: Sequelize.STRING },
}, {
  freezeTableName: true // Model tableName will be the same as the model name
});

// Sync model with database
NetatmoMeasurement.sync({force: false})


var NetatmoStore = assign({}, EventEmitter.prototype, {

  init: function(rawMeasurements) {
    var me = this;
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
        noise: measurement[4],
        yaayCo2Text: createTextFromCO2(measurement[1]),
				yaayNoiseText: createTextFromNoise(measurement[4]),
      }
			me.addToDatabase(_measurements[key]);

      _newestID = key;
      changed = true;
    })

    if(changed) this.emitChange();
  },

	addToDatabase: function(measurement) {
		NetatmoMeasurement.create(measurement);
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
