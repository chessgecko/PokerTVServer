// Load required packages
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');

var request = require('request');
var async = require('async');
var parseString = require('xml2js').parseString;
var fs = require('fs');
var sql = require('mssql');

var bumpFunction = require('./controllers/bumpFunctionController')

//create our db connection
var config = {
  user:'downlowd',
  password:'Bumpapp22',
  server:"zre4az2wiu.database.windows.net,1433",
  database:"downlowd db",
  options:{
    encrypt:true
  }
}

// Create our Express application
var app = express();

var http = require('http');

var server = http.createServer(app).listen((process.env.PORT), function(){
  console.log('Express server listening on port ' + (process.env.PORT));
});
app.set("view engine", "ejs");

// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
  extended: true
}));
// Add headers
app.use(function (req, res, next) {
  //console.log("here");
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Authorization");
  next();
});

var io = require('socket.io').listen(server);

bumpFunction.connectIo(io);

io.on('connection', function(socket){
  bumpFunction.handleSocket(socket);
})

io.on('error', function(socket, error){
  console.log(error);
})

// Create our Express router
var router = express.Router();



app.use(express.static(__dirname + "/public"));
console.log(__dirname + "/public");

/*
router.route('/').get(function(req, res){
	res.send("hello world");
});
*/
app.get('/', function(req, res){
  res.render('index.ejs');
});

//router.route('/getNumber/:myjsonid').get(gitFunctions.pushFunction);


// Register all our routes with /api
app.use('/', router);
//var port = process.env.PORT || 80;
// Start the server
//app.listen(port);

select p1.phone, p2.phone, 
from Exchange, Persons p1, Persons p2
where Exchange.phone1 = Exchange.phone2 and 
Exchange.phone1 = p1.phone and Exchange.phone2 = p2.phone
and p2.isRecruiter = 1;
