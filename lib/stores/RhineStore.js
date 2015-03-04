var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');

var CHANGE_EVENT = 'change';

var _newestID = null;
var _measurements = {};

var RhineStore = assign({}, EventEmitter.prototype, {

  init: function(rawData) {
    var changed = false;
    
    var measurement = rawData['results']['rhine'][0]
    
    var date = new Date( measurement['date'] ),
        discharge = parseInt( measurement['discharge'].replace("\'", "") ),
        waterlevel = parseInt(measurement['waterlevel']),
        temperature = parseFloat(measurement['temperature'])
        
    var newestMeasurement = this.getNewest()
    if( newestMeasurement && newestMeasurement['date'].getTime() == date.getTime() ) return; // same measurement time, do not update 
    
    var key = _newestID ? _newestID+1 : 0;
    
    _measurements[key] = {
      date: date,
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