var server = require('./server');
var db = require('./dbconnection');

server.start();
db.init();
