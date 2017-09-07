var mysql = require('mysql');
var helpers = require('./helpers');
var md5 = require('md5');
    
var DB_NAME = 'mbommir1';
var TABLE_USERS = 'users';
var TABLE_LOGINS = 'logins';
var TABLE_EVENTS = 'events';

var connectDB = function() {
  var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
  	password: '',
    database: DB_NAME
  });
  return con;
};

var connectSQL = function() {
  var con = mysql.createConnection({
    host: 'localhost',
  	user: 'root',
  	password: ''
  });
  return con;
};

var createDB = function(con) {
  var con = connectSQL();
  var self = this;
  con.connect(function(err) {
    if (err) throw err;
    console.log('Connected!');
    con.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`, function (err, result) {
      if (err) throw err;
      console.log('Database created');
    });
	 		
    con.query(`USE ${DB_NAME}`, function (err) {
      if (err) throw err;
      console.log('Database selected');
    });
	 
    var sql = `CREATE TABLE IF NOT EXISTS ${TABLE_USERS} (user_name VARCHAR(255) NOT NULL UNIQUE, password CHAR(32) NOT NULL)`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(`${TABLE_USERS} table created`);
      
      var sql = `SELECT COUNT(*) as count FROM ${TABLE_USERS}`;
      con.query(sql, function (err, result) {
        if (err) throw err;
        if(result[0].count == 0) {
            insertUser('aaa', md5('123'), function (err) {
              if (err) {console.log(err + '- mas');}
            });
            insertUser('bbb', md5('123'), function (err) {
              if (err) {console.log(err);}
            });
          insertUser('ccc', md5('123'), function (err) {
            if (err) {console.log(err);}
          });
        }
      });
      
    });
    
    var sql = `CREATE TABLE IF NOT EXISTS ${TABLE_LOGINS} (user_name VARCHAR(255) NOT NULL, time VARCHAR(255) NOT NULL)`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(`${TABLE_LOGINS} table created`);
    });  
    
    var sql = `CREATE TABLE IF NOT EXISTS ${TABLE_EVENTS} (user_name VARCHAR(255) NOT NULL, event_type VARCHAR(255) NOT NULL, url VARCHAR(255) NOT NULL, value VARCHAR(255), time VARCHAR(255) NOT NULL)`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log(`${TABLE_EVENTS} table created`);
    });
  });
}

exports.init = function () {
	var con = connectDB();
	createDB(con);
};

function insertUser(name, pass, callback) {
  var con = connectDB();
  con.connect(function(err) {
    if (err) throw err;
    var sql = `INSERT INTO ${TABLE_USERS} VALUES ('${name}', '${pass}')`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      callback(err, name);
    });
  });
}

exports.addUser = function (name, pass, callback) {
  insertUser(name, pass, callback);
}

exports.hasUser = function (name, callback) {
  var con = connectDB();
  con.connect(function(err) {
    var sql = `SELECT COUNT(*) as count FROM ${TABLE_USERS} WHERE user_name = '${name}'`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      callback(err, result[0].count);
    });
  });
}

exports.getUser = function (name, callback) {
  var con = connectDB();
  con.connect(function(err) {
    var sql = `SELECT * FROM ${TABLE_USERS} WHERE user_name = '${name}'`;
    console.log(sql);
    con.query(sql, function (err, result) {
      if (err) throw err;
      callback(err, result[0]);
    });
  });
}

exports.addLoginInstance = function (name, callback) {
  var con = connectDB();
  var time = helpers.getCurrentTime();
  con.connect(function(err) {
    if (err) throw err;
    var sql = `INSERT INTO ${TABLE_LOGINS} VALUES ('${name}', '${time}')`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      callback(err);
    });
  });
}

exports.getUserLoginHistory = function (name, callback) {
  var con = connectDB();
  con.connect(function(err) {
    if (err) throw err;
    var sql = `SELECT time FROM ${TABLE_LOGINS} WHERE user_name = '${name}'`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      callback(err, result);
    });
  });
}

exports.getUserEventHistory = function (name, callback) {
  var con = connectDB();
  con.connect(function(err) {
    if (err) throw err;
    var sql = `SELECT * FROM ${TABLE_EVENTS} WHERE user_name = '${name}'`;
    con.query(sql, function (err, result) {
      if (err) throw err;
      callback(err, result);
    });
  });
}

exports.addEventData = function (data, callback) {
  var con = connectDB();
  con.connect(function(err) {
    if (err) throw err;
    var time = helpers.getCurrentTime();
    var val = helpers.getFormattedAddInfo(data.value, data.element, data.event_type);
    var sql = `INSERT INTO ${TABLE_EVENTS} VALUES ('${data.user}', '${data.event_type}', '${data.url}', '${val}', '${time}')`;
        
    con.query(sql, function (err, result) {
      if (err) throw err;
      callback(err);
    });
  });
}