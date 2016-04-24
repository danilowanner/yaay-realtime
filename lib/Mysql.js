var mysql = require('mysql');
var URL = require('url-parse');
var Promise = require('es6-promise').Promise;

var url = new URL(process.env.DATABASE_URL);

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}


var Mysql = {
  connection: undefined,

  init: function() {
    this.createConnection();
    this.setupEventHandlers();
    this.connect();
  },

  createConnection: function() {
    this.connection = mysql.createConnection({
      host     : url.hostname,
      port     : url.port,
      user     : url.username,
      password : url.password,
      database : url.pathname.substr(1)
    });
  },

  setupEventHandlers: function() {
    connection.on('error', function(err) {
      console.log('DB error', err);
      if(err.code === 'PROTOCOL_CONNECTION_LOST') {
        this.init();
      } else {
        throw err;
      }
    });
  },

  connect: function() {
    this.connection.connect(function(err) {              // The server is either down
      if(err) {                                     // or restarting (takes a while sometimes).
        console.log('Error when connecting to db:', err);
        setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
      }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                            // If you're also serving http, display a 503 error.
  },

  test: function() {
    return new Promise(function(resolve, reject) {
      this.connection.query('SELECT 1', function(err, rows) {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },

}

module.exports = Mysql;
