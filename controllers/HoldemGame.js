var Deck = require('./Deck')
var Player = require('./HoldemPlayer')
exports.holdemgame = function(players){
	this.players = convert_players(players);
	this.big = 2;
	this.smallcost = 5;
	this.bigcost = 10;
	this.deck = Deck.deck();
	this.deck.shuffle();
	this.table = [];
	this.game_over = false;
	this.currentplayer = 0;
	
		
	
	deal_round(this.players, this.deck, this.table);
	this.players_still_in_round = init_players_in_round(this.players);
	
	var nextAction = function(){
		 var ret = {};
		 ret["playernum"] = 
		 
		 
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



var deal_round = function(players, deck, table){
	deal_players(players, deck);
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