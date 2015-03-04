var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var _newestID = null;
var _connections = {};

var TransportStore = assign({}, EventEmitter.prototype, {

  init: function(rawConnections) {
    var changed = false;
    
    /*var i=1;
    rawConnections['connections'].forEach(function (connection) {
      console.log(i+") "+connection['from']['departure']+" "+connection['from']['delay']);
      i++;
    })
    */
    
    // only get next connection
    var connection = rawConnections['connections'][0];

    var departureTimestamp = connection['from']['departureTimestamp'],
        departureDate = new Date(departureTimestamp*1000),
        departureAPI = connection['from']['departure'],
        delay = connection['from']['delay']
    
    var newestConnection = this.getNewest()
    if( newestConnection && newestConnection['departureTimestamp'] == departureTimestamp )
    {
      // same departure, check for changes
      var key = _newestID
      // do not update if data is the same
      if( newestConnection.delay == delay &&
          newestConnection.departureAPI == departureAPI) return
    }
    else {
      var key = _newestID ? _newestID+1 : 0;
    }
    
    // save data if changed or new
    _connections[key] = {
      departure: departureDate,
      departureTimestamp: departureTimestamp,
      departureAPI: departureAPI,
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