// Load required packages
var express = require('express');
var bodyParser = require('body-parser');


var request = require('request');
var async = require('async');
var parseString = require('xml2js').parseString;
var fs = require('fs');

var Main = require('./controllers/MainController')

// Create our Express application
var app = express();

var http = require('http');

var server = http.createServer(app).listen(process.env.PORT, function(){
  //onsole.log('Express server listening on port ' + (process.env.PORT));
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

Main.connectIo(io);

io.on('connection', function(socket){
  
  Main.handleSocket(socket);
})

io.on('error', function(socket, error){
  console.log(error);
})

// Create our Express router
var router = express.Router();



app.use(express.static(__dirname + "/public"));

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
//app.listen(port)