function Deck() {
    this.cards = [];
    this.shuffle = function(){
      var cs = [];
      for(var i = 0; i<52; i++){
        cs.push(i);
      }
      for(var i = 51; i>0; i--){
        var randpos = Math.floor(Math.random()*(i+1))
        var temp = cs[randpos];
        cs[randpos] = cs[i];
        cs[i] = temp;
      }
      this.cards = cs;
    }
    this.deal = function(numCards){
      var ret = []
      while(numCards > 0){
        ret.push(this.cards.pop());
        numCards--;
      }
    }
}

module.exports = Deck;