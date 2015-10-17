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
	this.currentplayer = 0;
	this.playersInHand = init_players_in_hand(this.players);
	
	//for determining whose turn it is
	this.first_round = true;
	this.peoplePlayed = 0;
	
	//array of bets this round
	this.round_bets = [];
	
	this.init_round_bets = function(){
		if(this.first_round){
			var bigpos = (this.dealer+2)%(this.players.length);
			var smallpos = (this.dealer+1)%(this.players.length);
			
			this.players[bigpos].money -=10;
			this.players[smallpos].money -=5;

			var ret = Array(this.players.length);
			for(var i = 0; i<ret.length; i++){
				ret[i] = 0;
			}
			ret[bigpos] = this.bigcost;
			ret[smallpos] = this.bigcost/2;
			return ret;
		}
		return Array(this.players.length);
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
		
		var curmax = -1;
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
			this.round_bets[pn] = -1;
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
	
	this.evaluate = function(){
		
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

module.exports = HoldemGame;