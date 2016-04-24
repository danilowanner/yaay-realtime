var Sequelize = require('sequelize');

var dbUrl = process.env.DATABASE_URL
            ? process.env.DATABASE_URL
            : 'mysql://root@localhost/realtimedb';

var sequelize = new Sequelize(dbUrl);

module.exports = sequelize;
