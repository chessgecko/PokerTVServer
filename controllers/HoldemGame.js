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
			if(this.round_bets[pn] < 0){
				this.round_bets[pn] = 0;
			}
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
		
		if(this.table.length == 5){
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
		
		var temp = compareWin(validPlayers[0], validPlayers[1], table);
		if(temp == 0){
			currentWinners.concat([validPlayers[0], validPlayers[1]]);
		}else if(temp == 1){
			currentWinners.push(validPlayers[0]);
		} else {
			currentWinners.push(validPlayers[1]);
		}
		
		for(var i = 2; i<validPlayers.length; i++){
			temp = compareWin(currentWinners[currentWinners.length-1], validPlayers[i], table);
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
		if(this.first_round && minbet == this.bigcost && prevPN == (this.dealer + 1)%(this.players.length)){
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
				"winner":winnerArray
			}
		}
		
		//put the next card on the table
		if(this.table.length == 0){
			this.table.concat(this.deck.deal(3));
		}else{
			this.table.concat(this.deck.deal(1));
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
	var temp = []
	for(var i =0; i<players.length; i++){
		temp.push(1);
	}
	return temp;
}

var compareWin = function(player1, player2, table){
		var sum1 = 0;
		var sum2 = 0;
		for(var i = 0; i< player1.length; i++){
			sum1+=player1[i];
			sum2+=player2[i];
		}
		
		if(sum1 == sum2)
			return 0;
		if(sum1 > sum2)
			return 1;
		
		return 2;
	}

module.exports = HoldemGame;