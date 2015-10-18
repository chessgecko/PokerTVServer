var Deck = require('./Deck')
var Player = require('./HoldemPlayer')
function HoldemGame(players){
	this.players = convert_players(players);
	this.dealer = 0;
	this.bigcost = 10;
	this.deck = new Deck();
	this.deck.shuffle();
	this.table = [];
	this.game_over = false;
	this.playersInHand = init_players_in_hand(this.players);
	this.totalPot = 0;
	
	//for determining whose turn it is
	this.first_round = true;
	this.peoplePlayed = 0;
	
	//array of bets this round
	this.round_bets = [];
	
	//init the bets for the round
	this.init_round_bets = function(){
		var ret = Array(this.players.length);
		for(var i = 0; i<ret.length; i++){
			ret[i] = -1;
		}
		if(this.first_round){
			var bigpos = (this.dealer+2)%(this.players.length);
			var smallpos = (this.dealer+1)%(this.players.length);
			this.players[bigpos].money -=10;
			this.players[smallpos].money -=5;
			ret[bigpos] = this.bigcost;
			ret[smallpos] = this.bigcost/2;
			return ret;
		}
		return ret;
	}
	//call this
	this.deal_hand = function(){
		this.round_bets = this.init_round_bets();
		deal_players(this.players, this.deck);
	}
	
	this.curPot = function(){
		var temp = this.totalPot;
		for(var i = 0; i<this.round_bets.length; i++){
			if(this.round_bets[i] > 0)
				temp+=this.round_bets[i];
		}
		return temp;
	}
	
	//dealer
	//
	//
	//
	//
	
	this.getCurrentPlayerNum = function(){
		return (this.first_round? (this.dealer + 3+ this.peoplePlayed):(this.dealer + 1+ this.peoplePlayed))%(this.players.length);
	}
	
	this.minBet = function(){
		var cpl = this.getCurrentPlayerNum();
		
		if(this.players[cpl].money == 0){
			return this.round_bets[cpl];
		}
		
		var curmax = 0;
		for(var i = 0; i<this.round_bets.length;i++){
			if(this.round_bets[i] > curmax){
				curmax = this.round_bets[i];
			}
		}
		if(curmax > this.round_bets[cpl]){
			return curmax;
		}else{
			return this.round_bets[cpl];
		}
	}
	
	
	
	//call this
	this.getNextAction = function(){
		var ret = {};
		ret["playernum"] = this.getCurrentPlayerNum();
		ret["minBet"] = this.minBet();
		ret["maxBet"] = 100;
		ret["money"] = this.players[ret["playernum"]].money;
		return ret;
	}
	
	
	/**
	 * this object should have a bet total: btotal and fold:true|false
	 * it will take the action for the current player
	 * if the action cannot be taken it will return false;
	 */
	this.takeNextAction = function(actionOb){
		var pn =this.getCurrentPlayerNum();
		//test if the player folds
		if(this.round_bets[pn] < 0){
			this.round_bets[pn] = 0;
		}
		if(actionOb.fold){
			this.playersInHand[pn] = 0;
			return {
				"success":true,
				"message":"folded"
			}
		}
		//test if the player bet is an all in
		if(actionOb["total"] == this.round_bets[pn] + this.players[pn].money){
			this.round_bets[pn] = actionOb["total"];
			this.playersInHand[pn] = .5;
			this.players[pn].money = 0;
			return {
				"success":true,
				"message": "went all in"
			}
		}
		//test if the player  can pay it
		if(actionOb["total"] > this.round_bets[pn] + this.players[pn].money){
			return {
				"success":false,
				"message":"not enough money"
			}
		} 
		//test if the bet is high enough
		else if(actionOb["total"] < this.minBet()) {
			return {
				"success": false,
				"message":"did not bet high enough"
			}
		} else {
			this.players[pn].money-=(Math.abs(actionOb["total"]) - this.round_bets[pn]);
			this.round_bets[pn] = actionOb["total"];
			return {
				"success": true,
				"message": "money left: "+this.players[pn].money
			}
		}
	}
	
	//determine if the hand is over given that the round is over
	//the conditions are 1: 5 cards on the table 2: everyone but one folded or all in
	this.handOver = function(){
		console.log(this.table);
		if(this.table.length == 5){
			console.log("table=5");
			return true;
		}
		var count = 0;
		for(var i = 0; i<this.playersInHand.length; i++){
			if(this.playersInHand[i] == 1){
				count++;
			}
		}
		return count <= 1;
	}
	
	
	//helper function for findwinner (returns 1 for p1wins 2 for p2wins and 0 for tie)
	//player1 and player2 are just the cards that player1 and player2 have
	
	
	/**
	 * determine who won the hand
	 * this will return an array of winners to split the money among
	 */
	this.findWinner = function(){
		var table = this.table;
		var validPlayers = [];
		for(var i = 0; i<this.playersInHand.length; i++){
			if(this.playersInHand[i] > 0){
				console.log(this.players[i]);
				validPlayers.push(this.players[i]);
			}
		}
		

		var currentWinners = [];
		if(validPlayers.length == 1){
			for(var i = 0; i<this.players.length; i++){
				if(validPlayers[0] == this.players[i]){
					return [i];
				}
			}
			return ["error should never reach here"];
		}
		
		var temp = compareWin(validPlayers[0].cards, validPlayers[1].cards, table);
		if(temp == 0){
			currentWinners.concat([validPlayers[0], validPlayers[1]]);
		}else if(temp == 1){
			currentWinners.push(validPlayers[0]);
		} else {
			currentWinners.push(validPlayers[1]);
		}
		
		for(var i = 2; i<validPlayers.length; i++){
			temp = compareWin(currentWinners[currentWinners.length-1].cards, validPlayers[i].cards, table);
			if(temp == 0){
				currentWinners.push(validPlayers[i]);
			}
			if(temp == 2){
				currentWinners = [validPlayers[i]];
			}
		}
		var winpositions = [];
		for(var j = 0; j<currentWinners.length; j++){
			for(var i = 0; i<this.players.length; i++){
				if(currentWinners[j] == this.players[i]){
					winpositions.push(i);
				}
			}
		}
		return winpositions;
	}
	
	/**
	 * if it advances to the next round: "nextRound":false
	 * if there is a winner: "over":false + "winner":0-p 
	 * how they won "winBy":"two pairs"
	 * if it advances or there is a winner it will set everything up for the next getNextAction()
	 */
	
	this.evaluate = function(){
		//first we will check if this round is over
		//iterate through the list and see if there is anyone who has not matched or folded
		var prevPN = this.getCurrentPlayerNum();
		var minbet = this.minBet();
		for(var i = prevPN+1; i%(this.players.length)!= prevPN; i++){
			if(this.round_bets[i%(this.players.length)] < minbet && this.playersInHand[i%(this.players.length)]===1){
				this.peoplePlayed = this.peoplePlayed+i-prevPN;
				return {
					"nextRound": false,
					"over":false
				}
			}
			
		}
		//check for case where this fails
		if(this.first_round && minbet == this.bigcost && this.peoplePlayed < this.players.length-1){
			this.peoplePlayed++;
			return {
				"nextRound": false,
				"over":false
			}	
		}
		
		//the round is done, determine if the game is over
		//the conditions are 1: 5 cards on the table 2: everyone but one folded or all in
		//determine who wins and assign them the pot/splitting if needed
		//set up the next hand
		if(this.handOver()){
			//deal the rest of the game
			if(this.table.length < 5){

				var temp = this.deck.deal(5-this.table.length);
				console.log(temp);
				this.table = this.table.concat(temp);
			}
			var finalTable = this.table.slice(0);

			//determine who won the game
			var winnerArray = this.findWinner();
			for(var k = 0; k<this.round_bets.length; k++){
				if(this.round_bets[k] > 0){
					this.totalPot+=this.round_bets[k];
				}
			}
			for(var k = 0; k<winnerArray.length; k++){
				this.players[winnerArray[k]].money+=Math.floor(this.totalPot/winnerArray.length);
			}
			
			//set up the new round
			this.first_round = true;
			//reset the table
			this.table = [];
			
			//reset the players cards
			//this also resets the bets
			this.deal_hand();
			this.totalPot = 0;
			this.peoplePlayed = 0;
			
			return{
				"nextRound": true,
				"over":true,
				"winner":winnerArray,
				"finalTable":finalTable
			}
		}
		
		//put the next card on the table
		if(this.table.length == 0){
			this.table = this.table.concat(this.deck.deal(3));
		}else{
			this.table = this.table.concat(this.deck.deal(1));
		}
		
		//reset all the bets
		this.first_round = false;
		
		for(var k = 0; k<this.round_bets.length; k++){
			if(this.round_bets[k] > 0){
				this.totalPot+=this.round_bets[k];
			}
		}
		//reset the counter
		this.peoplePlayed = 0;
		
		this.round_bets = this.init_round_bets();
		
		//advance the round
		return{
			"nextRound": true,
			"over":false
		}
	}
}

//players have a nonce and a name 
var convert_players = function(players){
	var ret = [];
	for(var i = 0; i<players.length; i++){
		ret.push(new Player(players[i].name));
	}
	return ret;
}

//still_used
var deal_players = function(players, deck){
	for (var i = 0; i<players.length; i++){
		players[i].cards = deck.deal(2);
	}
}

var init_players_in_hand = function (players){
	var temp = [];
	for(var i =0; i<players.length; i++){
		temp.push(1);
	}
	return temp;
}

var compareWin = function(player1, player2, table){

	var c4 = checkForFourOfAKind(player1, player2, table);
	if(c4 != 0)
		return c4;
	
	var s = checkForStraight(player1, player2, table);
	if(s!=0){
		return s;
	}
	var c3 = checkForThreeOfAKind(player1, player2, table);
	if(c3 != 0)
		return c3;
		
	var c2 = checkForPair(player1, player2, table);
	if(c2 != 0)
		return c2;
	
	var p1c = Math.max(player1[0], player1[1]);
	var p2c = Math.max(player2[0], player2[1]);
	if(p1c > p2c)
		return 1;
	if(p2c > p1c)
		return 2;
	return 0;
}

var checkForStraightFlush = function(player1, player2, table){
	var p1All = player1.concat(table);
	var p2All = player2.concat(table);
}

var checkForFourOfAKind = function(player1, player2, table){
	var p1 = player1.concat(table).sort(sortNumber);
	var p2 = player2.concat(table).sort(sortNumber);
	
	var p1ret = -1;
	var p2ret = -1;
	
	for(var i = 0; i< p1.length-3; i++){
		var count = 1;
		for(var j = i+1; j<p1.length; j++){
			if(p1[i]%13 == p1[j]%13){
				count++;
			}
		}
		if(count == 4){
			p1ret = p1[i]%13
		}
	}
	
	for(var i = 0; i< p2.length-3; i++){
		var count = 1;
		for(var j = i+1; j<p2.length; j++){
			if(p2[i]%13 == p2[j]%13){
				count++;
			}
		}
		if(count == 4){
			p2ret = p2[i]%13
		}
	}
	if(p1ret > p2ret){
		return 1;
	} else if(p2ret > p1ret){
		return 2;
	} else {
		return 0;
	}
}

var checkForStraight = function(player1, player2, table){
	var p1 = player1.concat(table).sort(sortNumber2);
	var p2 = player2.concat(table).sort(sortNumber2);
	
	var p1ret = -1;
	var p2ret = -1;
	
	for(var i = 0; i< p1.length-4; i++){
		var count = 1;
		var prev = p1[i];
		for(var j = i+1; j<i+5; j++){
			if(prev +1 == p1[j]%13){
				count++;
			}else if(prev == p1[j]%13){
				
			} else {
				break;
			}
		}
		if(count == 5){
			p1ret = p1[i]%13;
		}
	}
	
	for(var i = 0; i< p2.length-4; i++){
		var count = 1;
		var prev = p2[i];
		for(var j = i+1; j<i+5; j++){
			if(prev +1 == p2[j]%13){
				count++;
			}else if(prev == p2[j]%13){
				
			} else {
				break;
			}
		}
		if(count == 5){
			p2ret = p2[i]%13;
		}
	}
	
	if(p1ret > p2ret){
		return 1;
	} else if(p2ret > p1ret){
		return 2;
	} else {
		return 0;
	}
}


var checkForThreeOfAKind = function(player1, player2, table){
	var p1 = player1.concat(table).sort(sortNumber);
	var p2 = player2.concat(table).sort(sortNumber);
	
	var p1ret = -1;
	var p2ret = -1;
	
	for(var i = 0; i< p1.length-2; i++){
		var count = 1;
		for(var j = i+1; j<p1.length; j++){
			if(p1[i]%13 == p1[j]%13){
				count++;
			}
		}
		if(count == 3){
			p1ret = p1[i]%13
		}
	}
	
	for(var i = 0; i< p2.length-2; i++){
		var count = 1;
		for(var j = i+1; j<p2.length; j++){
			if(p2[i]%13 == p2[j]%13){
				count++;
			}
		}
		if(count == 3){
			p2ret = p2[i]%13
		}
	}
	if(p1ret > p2ret){
		return 1;
	} else if(p2ret > p1ret){
		return 2;
	} else {
		return 0;
	}
}

var checkForPair = function(player1, player2, table){
	var p1 = player1.concat(table).sort(sortNumber);
	var p2 = player2.concat(table).sort(sortNumber);
	
	var p1ret = -1;
	var p2ret = -1;
	
	for(var i = 0; i< p1.length-1; i++){
		var count = 1;
		for(var j = i+1; j<p1.length; j++){
			if(p1[i]%13 == p1[j]%13){
				count++;
			}
		}
		if(count == 2){
			p1ret = p1[i]%13
		}
	}
	
	for(var i = 0; i< p2.length-1; i++){
		var count = 1;
		for(var j = i+1; j<p2.length; j++){
			if(p2[i]%13 == p2[j]%13){
				count++;
			}
		}
		if(count == 2){
			p2ret = p2[i]%13
		}
	}
	
	if(p1ret > p2ret){
		return 1;
	} else if(p2ret > p1ret){
		return 2;
	} else {
		return 0;
	}
}

function sortNumber(a,b) {
    return a - b;
}

function sortNumber2(a,b) {
    return a%13 - b%13;
}


module.exports = HoldemGame;