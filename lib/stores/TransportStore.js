var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var schedule = require('node-schedule')

var CHANGE_EVENT = 'change';

var _newestID = null;
var _connections = {};

// Garbage collector
// Remove data older than one day
var garbageRule = new schedule.RecurrenceRule();
garbageRule.hour = 3;
garbageRule.minute = 0;

schedule.scheduleJob(garbageRule, collectGarbage);
function collectGarbage() {
	var lengthBefore=0, lengthAfter=0;
	Object.keys(_connections).forEach(function (key) {
		lengthBefore++;
		var connection = _connections[key]

		var now = new Date();
		var oneDay = 1000*60*60*24;
		if( now.getTime()-connection.departure.getTime()<oneDay ) return lengthAfter++;

		delete _connections[key]
	});
	console.log("Transport Garbage Collector. before: "+lengthBefore+" after: "+lengthAfter)
}

var TransportStore = assign({}, EventEmitter.prototype, {

  init: function(rawConnections) {
    var changed = false,
				connection;

    // only get next connection of tram 8
		rawConnections['connections'].some(function isTram8 (connCandidate,index) {
			var firstJourneyName = connCandidate['sections'][0]['journey']['name'],
					isTram8 = firstJourneyName.indexOf("NFT 8")>=0;

			if(isTram8) connection = connCandidate;
			return isTram8
		})

		if(!connection) return console.log("No tram found in "+rawConnections['connections'].length+" connections!");

		var departureTimestamp = connection['from']['departureTimestamp'],
				departureDate = new Date(departureTimestamp*1000),
				rawDeparture = connection['from']['departure'],
				delay = connection['from']['delay'];

		var newestConnection = this.getNewest()
    if( newestConnection && newestConnection['departureTimestamp'] == departureTimestamp )
    {
      // same departure, check for changes
      var key = _newestID
      // do not update if data is the same
      if( newestConnection.delay == delay ) return
    }
    else {
      var key = _newestID!==null ? _newestID+1 : 0;
    }

    // save data if changed or new
    _connections[key] = {
      departure: departureDate,
      departureTimestamp: departureTimestamp,
      rawDeparture: rawDeparture,
      delay: delay
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
    return _connections[id];
  },

  getAll: function() {
    return _connections;
  },

  getNewest: function() {
    return _connections[_newestID];
  }

});

module.exports = TransportStore;
