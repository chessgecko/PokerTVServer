var Main = require('./Deck')

var openSockets = [];
var io;

//this is to remind me how the data in the socket will look
var sampleSocketData = {
	"socket": "",
	"data-added": false,
	"data":""	
}

exports.connectIo = function(myIo){
	io = myIo;
}

exports.handleSocket = function(socket){
	
	
	socket.on('error', function(err){
		console.log(err);
	})
	
	socket.on('connectAndJoinGame', function(msg){
		socket.emit('joinSuccess', 
		{
			'gameID': 'GYXQ',
			'playerName': 'name', 
			'playerNonce':'nonce' 
		})
	})
	
	socket.on('startGame', function(msg){
		io.emit('gameStart', {});
		io.emit('beginNewHand', {
			'bigBlindAmount': 10, 
			'smallBlindAmount': 10
			});
		io.emit('playerState', 
		{
			'money': 456, 
			'cards': [11, 51], 
			"yourturn": true, "callAmountAbsolute": 50, 
			"MaxRaiseAmountAbsolute": 200
		});	
	})
}