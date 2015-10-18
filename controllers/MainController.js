function updateAllPlayersForNewHand(room){
	var game = room["game"];
	var nextAction = game.getNextAction();
	console.log(nextAction);
	room["socket"].emit("updateTurn", {
		"playerName":game.players[nextAction.playernum].name
	});
	
	for(var j = 0; j< room["players"].length; j++){
		var tokens = [];
		if(j%game.players.length == game.dealer){
			tokens.push(["dealer"])
		}
		if((j+1)%game.players.length == game.dealer){
			tokens.push(["smallBlind"])
		}
		if((j+2)%game.players.length == game.dealer){
			tokens.push(["bigBlind"])
		}
		room["players"][j]["socket"].emit("beginNewHand", {
			"bigBlindAmount": game.bigcost,
			"smallBlindAmount": game.bigcost/2,
			"playerTokens":tokens
		});
		room["players"][j]["socket"].emit('playerState', {
			"money":game.players[j].money,
			"cards":game.players[j].cards,
			"yourTurn":false
		})
		if(j == nextAction.playernum){
			room["players"][j]["socket"].emit('yourTurn', {
				"money":game.players[j].money,
				"callAmountAbsolute":nextAction.minBet,
				"maxRaiseAmountAbsolute":nextAction.maxBet
			})
		}
	}
}

function makeid(len)
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for( var i=0; i < len; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

var HoldemGame = require('./HoldemGame')

var openSockets = [];
var io;

var rooms = []

exports.connectIo = function(myIo){
	console.log('connecting to IO');
	io = myIo;
}

exports.handleSocket = function(socket){
	console.log('handling Socket');
	socket.on('error', function(err){
		console.log(err);
	});
	
	
	
	//display connects to server for the first time
	socket.on('connectFirst', function(msg){
		console.log(msg);
		var id = makeid(4);
		rooms.push({'roomID':id, 'players':[], 'socket':socket});
		console.log(id);
		socket.emit('joinSuccess', 
		{
			"success": true,
			'roomID': id
		});
	})
	
	socket.on('connectAndJoinGame', function(msg){
		console.log(msg);
		for(var i = 0; i<rooms.length; i++){
			if(rooms[i]["roomID"] == msg["gameID"]){
				if(msg["playerName"]){
					var nonce = makeid(12);
					rooms[i]["players"].push({
							"name":msg["playerName"],
							"nonce":nonce,
							"socket": socket
						});
					socket.emit('joinSuccess', {
						'playerNonce':nonce
					});
					rooms[i]["socket"].emit('playerDidJoinGame', {
						"playerName":msg["playerName"]
					})
				}
				//worry about this later (reconnect with nonce) 
			}
		}
	})
	
	socket.on('startGame', function(msg){
		console.log('starting game')
		for(var i = 0; i<rooms.length; i++){
			if(rooms[i]["socket"] == socket){
				console.log("found socket");
				if(rooms[i]["players"].length > 1){
					console.log('found players');
					//initialize a new game and store it in the room
					var game = new HoldemGame(rooms[i]["players"]);

					rooms[i]["game"] = game;
					game.deal_hand();
					rooms[i]["socket"].emit("gameStart", {});
					
					for(var j = 0; j< rooms[i]["players"].length; j++){
						rooms[i]["players"][j]["socket"].emit("gameStart", {});
					}
					
					rooms[i]["socket"].emit("players", {"players":game.players});
					//get started and runs genNextAction
					updateAllPlayersForNewHand(rooms[i]);
				}
			}
		}
	});
	
	socket.on('sendMove', function(msg){
		console.log('in sendMove');
		for(var i = 0; i<rooms.length; i++){
			for(var j = 0; j<rooms[i]["players"].length; j++){
				if(socket == rooms[i]["players"][j]["socket"]){
					//deal with it here
					console.log(msg);
					var game = rooms[i]["game"];
					//do one iteration here
					var res = game.takeNextAction(msg);
					console.log(res)
					if(res["success"]){
						rooms[i]["socket"].emit('actionTaken', 
						{
							"name": game.players[j]["name"],
							"folded":msg["fold"], 
							"total":msg["total"]- game.old_bets,
							"money":game.players[j].money,
							"pot":game.curPot()
						});
						
						var myEval = game.evaluate();
						
						console.log(myEval);
						if(myEval["nextRound"]){
							rooms[i]["socket"].emit("endRound", {});
							rooms[i]["socket"].emit("table", {"table": game.table});
							for(var k = 0; k<rooms[i]["players"].length; k++){
								rooms[i]["players"][k]["socket"].emit('endRound', {});
							}
						}
						
						if(myEval["over"]){
							rooms[i]["socket"].emit('endHand',{
								"winner":game.players[myEval["winner"]].name,
								"finalTable":myEval["finalTable"],
								"players":game.players
							});
							
							for(var k = 0; k<rooms[i]["players"].length; k++){
								rooms[i]["players"][k]["socket"].emit('endHand', {});
							}
							console.log(game.players);
							updateAllPlayersForNewHand(rooms[i]);
						}else {
							var nextAction = game.getNextAction();
							console.log(nextAction);
							rooms[i]["socket"].emit("updateTurn", {
								"playerName":game.players[nextAction.playernum].name
							});
							for(var k = 0; k< rooms[i]["players"].length; k++){
								if(k == nextAction.playernum){
									rooms[i]["players"][k]["socket"].emit('yourTurn', {
										"money":game.players[k].money,
										"callAmountAbsolute":nextAction.minBet,
										"maxRaiseAmountAbsolute":nextAction.maxBet
									})
								}
							}
						}

						
					}else {
						socket.emit('invalid move',{'message':res['message']});
					}
					
					
				}	
			}
		}
	})
	
	socket.on('disconnect', function(){
		console.log('disconnect');
	})
}

