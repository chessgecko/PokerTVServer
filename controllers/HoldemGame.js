var Deck = require('./Deck')
var Player = require('./HoldemPlayer')
exports.holdemgame = function(players){
	this.players = convert_players(players);
	this.dealer = 0;
	this.smallcost = 5;
	this.bigcost = 10;
	this.deck = Deck.deck();
	this.deck.shuffle();
	this.table = [];
	this.game_over = false;
	this.currentplayer = 0;
	
	//for determining whose turn it is
	this.first_round = true;
	this.peoplePlayed = 0;
	
	//array of bets this round
	this.init_round_bets = function(){
		if(this.first_round){
			var bigpos = (this.dealer+2)%(this.players.length);
			var smallpos = (this.dealer+1)%(this.players.length);
			var temp = Array(this.players.length);
		}	
	}
	this.round_bets = this.init_round_bets();
		
	
	this.deal_round = function(){
		this.round_bets
		deal_players(this.players, this.deck);
	}
	this.players_still_in_round = init_players_in_round(this.players);
	//dealer
	//
	//
	//
	//
	var nextAction = function(){
		var ret = {};
		var distAround = (this.first_round? (this.dealer + 3+ this.peoplePlayed):
		(this.dealer + 1+ this.peoplePlayed))%(this.players.length);
		ret["playernum"] = distAround;
		ret[""]
		 
		return ret;
	}
	
}

var init_players_in_round = function(players){
	var temp = [];
	for(var i = 0; i<players.length; i++){
		temp.push(i);
	}
	return temp;
}

//players have a nonce and a name 
var convert_players = function(players){
	var ret = [];
	for(let player in players){
		var temp = Player.holdemplayer();
		temp.name = player.name;
		temp.nonce = player.nonce;
		ret.push(temp);
	}
	return ret;
}

var deal_players = function(players, deck){
	for (let player of players){
		player.cards = deck.deal(2);
	}
}

var deal_ret = function(deck, count){
	return deck.deal(count);
}