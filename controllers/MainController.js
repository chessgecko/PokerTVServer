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
		{'gameID': 'GYXQ','playerName': 'name', 'playerNonce':'nonce' })
	})
	
	socket.on('startGame', function(msg){
		io.emit('gameStart', {});
		io.emit('beginNewHand', {'bigBlindAmount': 10, 'smallBlindAmount': 10})
		io.emit('playerState', {'money': 456, 'cards': [11, 51], 
		"yourturn": true, "callAmountAbsolute": 50, "MaxRaiseAmountAbsolute": 200
		});	
	})
	
	socket.on('shareData', function(msg){
		console.log('shared data');
		console.log(msg);
		var testLoc = -1;
		for(var i = 0; i<openSockets.length; i++){
			if(openSockets[i] ==null){
				continue;
			}
			if(openSockets[i]["socket"] == socket){
				openSockets[i]["data-added"] = 2;
				openSockets[i]["data"] = msg;
				testLoc = i;
			}
		}
		if(testLoc == -1){
			return;
		}
		if(openSockets[testLoc]["partner"] != null && openSockets[testLoc]["partner"]["data"] != null){
			var person1 = openSockets[testLoc];
			var person2 = person1["partner"];
			console.log(person2["data"])
			
			
			person1["socket"].emit('sharedData', person2["data"])
			console.log(person1["data"]);
			person2["socket"].emit('sharedData', person1["data"])
			console.log("done with person2")
			resetPerson(person1)
			resetPerson(person2)
		}
	})
	
	socket.on('disconnect', function(){
		for(var i = 0; i<openSockets.length; i++){
			if(openSockets[i].socket == socket){
				openSockets.splice(i, 1);
			}
		}
	})
}

var bumpedEachOther = function(data1, data2){
	if(data1 == null || data2 == null || data1["location"] == null || data2["location"] == null){
		return false;
	}
	var retval = locCloseEnough(data1["location"]["lat"], data2["location"]["lat"]);
	retval = retval && locCloseEnough(data1["location"]["lon"], data2["location"]["lon"]);
	retval = retval && timeCloseEnough(data1["timestamp"], data2["timestamp"])
	return retval;
}
var timeCloseEnough = function(t1, t2){
	return Math.abs(t1 - t2) <= 15;
}

var locCloseEnough = function(loc1, loc2){
	return true;
}

var resetPerson = function(person){
	if(person == null){return}
	person["data-added"] = 0;
	person["location"] = "";
	person["name"] = "";
	person["velocity"] = "";
	person["partner"] = null;
	person["data"] = null;
}