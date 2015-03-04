var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var _newestID = null;
var _measurements = {};

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