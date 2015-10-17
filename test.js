var HoldemGame = require('./controllers/HoldemGame');

var serverPlayers = [{'name':'name1'}, {'name': 'name2'}, {'name':'name3'}, {'name': 'name4'}]

var testGame = new HoldemGame(serverPlayers);

testGame.deal_hand();
var action = testGame.getNextAction();
var myAct = {
	"total":1,
	"fold":false
};
testGame.takeNextAction(myAct);
testGame.evaluate();

