var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var md5 = require('md5');
var helpers = require('./helpers');
var db = require('./dbconnection');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
var jsonParser = bodyParser.json();

exports.start = function() {

	var app = express();
	
	app.use(express.static('public'));
  
    app.use(cookieParser());
    
    app.use(session({
      secret: 'mbommir1',
      resave: false,
      saveUninitialized: true
    }));
	
	app.set('view engine', 'pug');
	
	app.set('views','./views');
	
	app.get('/signup', function(req, res){
      if(req.session.user)
        res.redirect(302, '/');
      else
        res.render('signup');
	});
	
	app.post('/signup', urlencodedParser, function(req, res) {
      console.log('request for signup');
      if(!req.body.user_name || !req.body.password) {
        res.status('400');
        res.render('signup', {message: 'Please enter both user name and password!'});
      } else if (!helpers.isValidUserName(req.body.user_name)) {
        res.status('400');
        res.render('signup', {message: 'Only alphanumeric charaters are allowed in the username!'});
      } else {
        db.hasUser(req.body.user_name, function(err, count) {
            if (count > 0) {
              res.render('signup', {
                message: 'User Already Exists! Login or choose another user name'
              });
            }
            else {
              db.addUser(req.body.user_name, md5(req.body.password), function (err, name) {
                req.session.user = name;
                res.cookie('user', name);
                console.log('new user signed in');
                db.addLoginInstance(name, function () {
                  res.redirect(302, '/');
                });
              }); 
            }
        });
      }
	});
  
    app.post('/login', urlencodedParser, function(req, res) {
      
      if(!req.body.user_name || !req.body.password){
        res.render('login', {message: 'Please enter both user name and password'});
      } else {
        db.getUser(req.body.user_name, function(err, user) {
          if(user && user.user_name === req.body.user_name && user.password === md5(req.body.password)){
            res.cookie('user', user.user_name);
            req.session.user = user.user_name;
            console.log('user logged in');
            db.addLoginInstance(user.user_name, function () {
              res.redirect(302, '/');
            });
          } else {
            res.render('login', {message: 'Invalid credentials!'});
          }
        });
      }
	});
  
    app.get('/login', function (req, res) {
      console.log('request for /login');
      if(req.session.user) {
        res.redirect(302, '/');
      } else {
        res.render('login');
      }
	});
  
    function checkLogIn(req, res, next) {
      if(req.session.user) {
        next();     //If session exists, proceed to page
      } else {
        res.redirect(302, '/login');
      }
    }
	
	app.get('/', checkLogIn, function (req, res) {
      var name = req.session.user;
      var result = {};
      db.getUserLoginHistory(name, function(err, loginData) {
        result.login_data = loginData;
        db.getUserEventHistory(name, function (err, eventData) {
          result.event_data = eventData;
          res.render('index', {name: name, result : result});
        });
      });
	});
  
    app.get('/logout', function(req, res) {
      console.log('request user log out');
      req.session.destroy(function() { // destroy session
        res.clearCookie('user'); // clear user name cookie
        res.redirect(302, '/login');
        console.log('user logged out');
      });
    });
  
    app.post('/eventlog', jsonParser, function(req, res) {
      if (req.body.data && req.body.data.user) {
        console.log('event log data received', req.body.data);
        db.addEventData(req.body.data, function (err){
          if (err) {
            res.status('400');
            res.send(err);
          } else {
            res.status('200');
            res.send('Success!');
          }
        });
      } else {
        res.status('400');
        res.send('Invalid request');
      }
    });

	var server = app.listen(8081, function () {
		var port = server.address().port
		console.log(`server listening at ${port}`);
	});
	
};