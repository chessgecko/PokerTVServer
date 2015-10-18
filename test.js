var HoldemGame = require('./controllers/HoldemGame');

var serverPlayers = [{'name':'name1'}, {'name': 'name2'}, {'name':'name3'}, {'name': 'name4'}]

var testGame = new HoldemGame(serverPlayers);

testGame.deal_hand();
var myAct = {
	"total":20,
	"fold":false
};
var myAct2 = {
	"total":20,
	"fold":false
};


for(var i = 0; i<4; i++){
	console.log(testGame.getNextAction());
	console.log(testGame.takeNextAction(myAct));
	console.log(testGame.evaluate());
}
for(var i = 0; i<16; i++){
	console.log(testGame.getNextAction());
	console.log(testGame.takeNextAction(myAct2));
	console.log(testGame.evaluate());
}