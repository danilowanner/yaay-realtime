var Promise = require('es6-promise').Promise
var schedule = require('node-schedule')

var getRhineKimono = require('./getRhineKimono')
var getRhineImportIo = require('./getRhineImportIo')
var getNetatmo = require('./getNetatmo')
var getTransport = require('./getTransport')
var getWeather = require('./getWeather')

/* Internal record of scheduled jobs */
var transportJob = null,
  rhineJob = null,
  netatmoJob = null,
  weatherJob = null

/* Internal record of target stores to save data to */
var transportStore = null,
    rhineStore = null,
    netatmoStore = null,
    weatherStore = null

var DataFetcher = {

  start: function() {
    var testRule = new schedule.RecurrenceRule();
        testRule.second = new schedule.Range(0, 59, 10);

    // Recurrence rules
    // Rule to execute every minute
    var minuteRule = new schedule.RecurrenceRule();
        minuteRule.minute = new schedule.Range(0, 59, 1);
    // Rule to execute every other minute
    var twoMinuteRule = new schedule.RecurrenceRule();
        twoMinuteRule.minute = new schedule.Range(0, 59, 2);
    // Rule to execute every quarter hour
    var quarterHourRule = new schedule.RecurrenceRule();
        quarterHourRule.minute = new schedule.Range(0, 59, 15);

    // Transport Opendata
    transportJob = schedule.scheduleJob(minuteRule, this.fetchTransport);

    // Kimono Rhine Temperature
    rhineJob = schedule.scheduleJob(quarterHourRule, this.fetchRhine);

    // Netatmo
    netatmoJob = schedule.scheduleJob(twoMinuteRule, this.fetchNetatmo);

    // Weather in Basel
    weatherJob = schedule.scheduleJob(quarterHourRule, this.fetchWeather);

    this.fetchTransport();
    this.fetchRhine();
    this.fetchNetatmo();
    this.fetchWeather();
  },

  setTransportStore: function(store) {
    transportStore = store;
  },

  setRhineStore: function(store) {
    rhineStore = store;
  },

  setNetatmoStore: function(store) {
    netatmoStore = store;
  },

  setWeatherStore: function(store) {
    weatherStore = store;
  },

  fetchTransport: function() {
    console.log('Fetching transport data.');

    getTransport().then(function(result) {
      // Save results into store
      if (transportStore) transportStore.init(result);
    }).catch(function(err) {
      console.log("Darnit! Couldn‘t load transport data.");
      console.log(err);
    });
  },

  fetchRhine: function() {
    console.log('Fetching rhine temperature.');

    getRhineImportIo().then(function(result) {
      // Save results into store
      if (rhineStore) rhineStore.init(result);
    }).catch(function(err) {
      console.log("Damn! Couldn‘t load rhine temperature.");
      console.log(err);
    });
  },

  fetchNetatmo: function() {
    console.log('Fetching netatmo data.');

    getNetatmo().then(function(result) {
      // Save results into store
      if (netatmoStore) netatmoStore.init(result);
    }).catch(function(err) {
      console.log("Shoot! Couldn‘t get netatmo stuff.");
      console.log(err);
    });
  },

  fetchWeather: function() {
    console.log('Fetching yahoo weather data.');

    getWeather().then(function(result) {
      // Save results into store
      if (weatherStore) weatherStore.init(result);
    }).catch(function(err) {
      console.log("Woopsie! Couldn‘t get weather data.");
      console.log(err);
    });
  },

  stop: function() {
    console.log("Heelp! I don’t know how to stop!")
  }

};

module.exports = DataFetcher;
