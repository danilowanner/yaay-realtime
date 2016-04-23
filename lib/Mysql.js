var mysql = require('mysql');
var URL = require('url-parse');
var Promise = require('es6-promise').Promise;

var url = new URL(process.env.DATABASE_URL);
var connection = mysql.createConnection({
  host     : url.host,
  port     : url.port,
  user     : url.username,
  password : url.password,
  database : url.pathname
});

var Mysql = {
  init: function() {

  },

  test: function() {
    return new Promise(function(resolve, reject) {
      connection.query('SELECT 1', function(err, rows) {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  },
  
}

module.exports = Mysql;
