var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var schedule = require('node-schedule');
var SunCalc = require('suncalc');
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
	console.log("Weather Garbage Collector. before: "+lengthBefore+" after: "+lengthAfter)
}

// Create yaay text from weather code
function createTextFromCode(code, text) {

	var now = new Date();
	var sun = getSun(now);

	if(sun.night) {
		if(code >= 26 && code <= 30) {
			return "It’s a cloudy night";
		}
		else {
			switch (Math.round(sun.moon.phase * 30)%30) {
		    case 0:
					return "New moon. Bring a flashlight!";
				case 1:
					return "There was a new moon yesterday";
				case 2: case 3: case 4: case 5:
					return "The moon is barely visible";
				case 6: case 7: case 8: case 9:
					return "First quarter of the moon";
				case 10: case 11: case 12: case 13:
					return "Soon it will be a full moon";
				case 14:
					return "Tomorrow it’s a full moon. Beware of werewolves";
				case 15:
					return "It’s a full moon. Beware of werewolves";
				case 16:
					return "Full moon is over. Phuhh...";
				case 17: case 18: case 19: case 20:
					return "Full moon is over. Phuhh...";
				case 21: case 22: case 23: case 24:
					return "Last quarter of the moon";
				case 25: case 26: case 27: case 28:
					return "Soon it will be a new moon again";
				case 29:
					return "Tomorrow it will be a new moon";
		  }
		}
	}
	else {
		switch (code) {
	    case 11: case 12:
	      return "It’s raining";
	    case 15: case 16: case 41: case 42: case 43:
	      return "It’s snowing";
			case 26:
	      return "I can see clouds, only clouds";
	    case 30:
	      return "It’s a bit cloudy";
	    case 31:
	      return "What a wonderful, clear night!";
	    case 32:
	      return "The sun is shining. enjoy!";
	    case 33:
	      return "It’s nice weather tonight!";
	    case 34:
	      return "It’s nice weather today!";
	    default:
	      return "Current condition: "+text.toLowerCase();
	  }
	}
}

// Select yaay icon from weather code
function selectIconFromCode(code) {

	var now = new Date();
	var sun = getSun(now);
	if(sun.night) {
		if(code >= 26 && code <= 30) {
			return "weather-cloudy";
		}
		else {
			switch (Math.round(sun.moon.phase * 8)%8) {
		    case 0:
					return "night-clear";
				case 1:
					return "night-waxingcrescent";
				case 2:
					return "night-firstquarter";
				case 3:
					return "night-waxinggibbous";
				case 4:
					return "night-fullmoon";
				case 5:
					return "night-waininggibbous";
				case 6:
					return "night-thirdquarter";
				case 7:
					return "night-waningcrescent";
		  }
		}
	}
	else {
		switch (code) {
	    case 32: case 33: case 34: case 36:
				return "weather-sunny";
			case 3: case 4: case 5: case 6: case 7: case 8: case 9: case 10: case 11: case 12: case 17: case 35: case 40:
				return "weather-rain";
			case 14: case 15: case 16: case 41: case 42: case 43: case 46:
				return "weather-snow";
			case 37: case 38: case 39:
				return "weather-thunders";
			case 27: case 28:
				return "weather-mostlycloudy";
			case 20: case 21: case 22:
				return "weather-fog";
			case 26:
				return "weather-cloudy";
			default:
				return "weather-cloudysun";
	  }
	}

}

// Get moon phase and whether it is day or night
function getSun(time) {
	//var now = new Date();
	var moon = SunCalc.getMoonIllumination(time);
	var times = SunCalc.getTimes(time, 47.585781, 7.59372);
	var night = times.sunriseEnd > time || times.sunset < time;

	return { moon: moon, night: night };
}


// Setup Sequelize model
var WeatherMeasurement = db.define('weatherMeasurement', {
	date: { type: Sequelize.DATE },
	rawDate: { type: Sequelize.STRING },
	code: { type: Sequelize.INTEGER },
	temp: { type: Sequelize.FLOAT },
	text: { type: Sequelize.STRING },
	yaayText: { type: Sequelize.STRING },
	yaayIcon: { type: Sequelize.STRING }
}, {
  freezeTableName: true // Model tableName will be the same as the model name
});

// Sync model with database
WeatherMeasurement.sync({force: false})


var WeatherStore = assign({}, EventEmitter.prototype, {

  init: function(rawData) {
    var changed = false;

		var condition = rawData.query.results.channel.item.condition;

    var date = new Date( condition['date'].replace("CET", "+0100").replace("CEST", "+0200") ),
        rawDate = condition['date'],
        code = parseInt(condition['code']),
        temp = parseInt(condition['temp']),
        text = condition['text'],
        yaayText = createTextFromCode(code, text),
        yaayIcon = selectIconFromCode(code);

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
      yaayIcon: yaayIcon
    }

		this.addToDatabase(_measurements[key]);

    _newestID = key;
    changed = true;

    if(changed) this.emitChange();
  },

	addToDatabase: function(measurement) {
		WeatherMeasurement.create(measurement);
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
