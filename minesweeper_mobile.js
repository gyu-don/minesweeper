Game.prototype.draw = function(){
    var i, x, y;
    var len = this.height * this.width;

    str = '<div class="board"><div class="counter">' + this.mines +
	'</div><div class="timer">0</div>' +
	'<button class="minereset"></button>' + 
	'<div class="tools"><form name="tap_mode">' +
	'<input name="tap" type="radio" id="tap_cl" value="click" checked>' +
	'<label for="tap_cl" class="click"><img src="click.png"></label>' + 
	'<input name="tap" type="radio" id="tap_rc" value="rightclick">' + 
	'<label for="tap_rc" class="rightclick"><img src="rightclick.png"></label>' +
	'<input name="tap" type="radio" id="tap_dc" value="doubleclick">' + 
	'<label for="tap_dc" class="doubleclick"><img src="doubleclick.png"></label>'+
	'</form></div><table>';
    for(y=0;y<this.height;y++){
	str += '<tr>';
	for(x=0;x<this.width;x++) str += '<td class="u0"></td>';
	str += '</tr>';
    }
    str += '</table></div>';

    this.draw_to.innerHTML = str;
    this.draw_to.getElementsByTagName("button")[0].onclick = this.reset.bind(this);
    this.counter_elem = this.draw_to.getElementsByTagName("div")[1];
    this.timer_elem = this.draw_to.getElementsByTagName("div")[2];

    this.cellelems = this.draw_to.getElementsByTagName("td");

    for(i=0;i<len;i++){
	this.cellelems[i].onclick = this.click_mobile_action.bind(this, i);
    }
}

Game.prototype.click_mobile_action = function(idx){
    switch(document.tap_mode.tap.value){
    case 'click':
	this.click_action(idx);
	break;
    case 'rightclick':
	this.rightclick_action(idx);
	break;
    case 'doubleclick':
	this.doubleclick_action(idx);
	break;
    default:
	console.log('tapmode is invalid value.');
    }
}

var game;
window.onload = function() {
    game = new Game(16, 30, 99, document.getElementById("main"));
    document.getElementById('in_w').value = game.width;
    document.getElementById('in_h').value = game.height;
    document.getElementById('in_n').value = game.mines;
};
