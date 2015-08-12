function Game(width, height, mines, draw_to){
    this.width = width;
    this.height = height;
    this.mines = mines;
    this.draw_to = draw_to;

    if(!this.game_validity()) return null;
    this.reset()
}

Game.prototype = {
    width: 0,
    height: 0,
    mines: 0,
    left_mines: 0,
    left_non_mines: null,
    draw_to: null,
    counter_elem: null,
    timer_elem: null,
    timer_value: 0,
    timer_id: 0,
    is_first_click: true,

    reset: function(){
	/* In this timing, position of mines is not determined.
	 * The cell of first click and around 8 cells are not mine
	 * to avoid a junk game.
	 * Therefore, we cannot determine the board until first click. */
	var len = this.width * this.height;

        clearInterval(this.timer_id);
        this.timer_value = 0;
        this.left_mines = this.mines;
	this.left_non_mines = len - this.mines;
        this.is_first_click = true;
        this.showncell = new Array(len);
        for(i=0;i<len;i++) this.showncell[i] = "u0";
        this.draw();
    },

    draw: function(){
        var i, x, y;
        var len = this.height * this.width;

        str = '<div class="board"><div class="counter">' + this.mines +
	    '</div><div class="timer">0</div>' +
            '<button class="minereset"></button><table>';
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
            this.cellelems[i].onclick = this.click_action.bind(this, i);
            this.cellelems[i].oncontextmenu = this.rightclick_action.bind(this, i);
            this.cellelems[i].ondblclick = this.doubleclick_action.bind(this, i);
        }
    },

    game_validity: function() {
        return this.width > 0 && this.height > 0 &&
            this.mines > 0 && this.width * this.height > this.mines;
    },

    first_click: function(idx){
        function get_cellstring(width, height, mines, len, firstidx){
            var i, j, tmp;
            var str;
            var l, r, t, b;
	    var n_safespace;

	    l = (firstidx % width) > 0;
	    r = (firstidx % width) < width - 1;
	    t = firstidx > width - 1;
	    b = firstidx < (height - 1) * width;
	    n_safespace = 9 - !(l&&t) - !t - !(r&&t) - !l - !r - !(l&&b) - !b - !(r&&b);
	    if(n_safespace > len - mines) n_safespace = 1;
            minemap = new Array(len);
            for(i=0;i<mines;i++) minemap[i] = 1;
            for(i=mines;i<len;i++) minemap[i] = 0;
            // shuffle
            for(i=len-1-n_safespace;i>0;i--){
                j = Math.floor(Math.random() * (i + 1));
                tmp = minemap[i];
                minemap[i] = minemap[j];
                minemap[j] = tmp;
            }
	    i = len - 1;
	    tmp = minemap[firstidx], minemap[firstidx] = minemap[i], minemap[i--] = tmp;
	    if(n_safespace > 1){
		l && t && (tmp = minemap[firstidx-width-1],
			minemap[firstidx-width-1] = minemap[i], minemap[i--] = tmp);
		t && (tmp = minemap[firstidx-width],
			minemap[firstidx-width] = minemap[i], minemap[i--] = tmp);
		r && t && (t = minemap[firstidx-width+1],
			minemap[firstidx-width+1] = minemap[i], minemap[i--] = tmp);
		l && (tmp = minemap[firstidx-1],
			minemap[firstidx-1] = minemap[i], minemap[i--] = tmp);
		r && (tmp = minemap[firstidx+1],
			minemap[firstidx+1] = minemap[i], minemap[i--] = tmp);
		l && b && (tmp = minemap[firstidx-width-1],
			minemap[firstidx+width-1] = minemap[i], minemap[i--] = tmp);
		b && (tmp = minemap[firstidx+width],
			minemap[firstidx+width] = minemap[i], minemap[i--] = tmp);
		r && b && (tmp = minemap[firstidx+width+1],
			minemap[firstidx+width+1]=minemap[i], minemap[i--] = tmp);
	    }

            str = "";
            for(i=0;i<len;i++){
                l = (i % width) > 0;
                r = (i % width) < width - 1;
                t = i > width - 1;
                b = i < (height - 1) * width;

                str += minemap[i] ? "*" : (
                        (l && t && minemap[i-width-1]) + (t && minemap[i-width]) + (r && t && minemap[i-width+1]) +
                        (l && minemap[i-1]) + (r && minemap[i+1]) +
                        (l && b && minemap[i+width-1]) + (b && minemap[i+width]) + (r && b && minemap[i+width+1]));
            }
            return str;
        }

        var i;
        var len = this.width * this.height;

	if(!this.game_validity()){
	    alert('Invalid parameter.')
	    return;
	}

        this.cellstring = get_cellstring(this.width, this.height, this.mines, len, idx);
	this.timer_id = setInterval(this.timer_inc.bind(this), 1000);
	this.is_first_click = false;
    },

    get_innertext: function(item){
        if(item[1] == "0") return "";
        else if(!isNaN(parseInt(item[1]))) return item[1];
        else if(item == "uf") return "";
        else if(item == "uq") return "?";
        else if(item == "ue") return "!";
        else if(item == "om") return "*";
        else return "@";  // Undefined symbol
    },

    resize_board: function(width, height, mines){
        width = parseInt(width);
        height = parseInt(height);
        mines = parseInt(mines);
        if(width <= 0 || height <= 0 || mines <= 0){
            alert('Positive integer values are required for width, height, number of mines.');
        }
        else if(mines >= width * height){
            alert('Number of mines must less than number of cells.');
        }
        else{
            this.width = width;
            this.height = height;
            this.mines = mines;
            this.reset();
        }
    },

    mine_click: function(){
        this.counter_elem.innerHTML = --this.left_mines;
        clearInterval(this.timer_id);
	this.draw_to.childNodes[0].style.backgroundColor = '#F0A0A0';
    },

    win: function(){
        clearInterval(this.timer_id);
	alert('You Win!');
    },

    set_showncell: function(idx, cellclass){
        this.showncell[idx] = cellclass;
        this.cellelems[idx].className = cellclass;
        this.cellelems[idx].innerHTML = this.get_innertext(cellclass);
    },

    open_cell: function(idx){
        this.set_showncell(idx, this.cellstring[idx] == "*" ? "om" : "o" + this.cellstring[idx]);
    },

    flagging: function(idx){
        if(this.showncell[idx] == 'u0'){
            this.set_showncell(idx, 'uf');
            this.counter_elem.innerHTML = --this.left_mines;
        }
    },

    unflagging: function(idx){
        if(this.showncell[idx] == 'uf'){
            this.set_showncell(idx, 'u0');
            this.counter_elem.innerHTML = ++this.left_mines;
        }
    },

    click_action: function(idx){
        var visited;
        var is_flagged;
        var l, r, t, b, w = this.width, h = this.height;

        if(this.is_first_click) this.first_click(idx)
        if(this.showncell[idx][0] != "o" && this.showncell[idx] != "uf"){
            this.open_cell(idx);
            if(this.cellstring[idx] == "0"){

                l = (idx % w) > 0;
                r = (idx % w) < w - 1;
                t = idx > w - 1;
                b = idx < (h - 1) * w;

                l && t && this.click_action(idx-w-1);
                t && this.click_action(idx-w);
                r && t && this.click_action(idx-w+1);
                l && this.click_action(idx-1);
                r && this.click_action(idx+1);
                l && b && this.click_action(idx+w-1);
                b && this.click_action(idx+w);
                r && b && this.click_action(idx+w+1);
            }
            if(this.cellstring[idx] == "*"){ this.mine_click(); }
	    else if(--this.left_non_mines == 0){ this.win(); }
        }
        return false;
    },

    rightclick_action: function(idx){
        if(this.showncell[idx][0] == 'o'){ /* nothing to do. */ }
        else if(this.showncell[idx] != 'uf') this.flagging(idx);
        else this.unflagging(idx);
        return false;
    },

    doubleclick_action: function(idx){
        var n;
        var l, r, t, b, w = this.width, h = this.height, mines;

        if(this.showncell[idx][0] == 'o'){
            n = parseInt(this.showncell[idx][1]);
            if(n){
                l = (idx % w) > 0;
                r = (idx % w) < w - 1;
                t = idx > w - 1;
                b = idx < (h - 1) * w;

                // count flags (& opened mines)
                mines = l && t && (this.showncell[idx-w-1] == "uf" || this.showncell[idx-w-1] == "om");
                mines += t && (this.showncell[idx-w] == "uf" || this.showncell[idx-w] == "om");
                mines += r && t && (this.showncell[idx-w+1] == "uf" || this.showncell[idx-w+1] == "om");
                mines += l && (this.showncell[idx-1] == "uf" || this.showncell[idx-1] == "om");
                mines += r && (this.showncell[idx+1] == "uf" || this.showncell[idx+1] == "om");
                mines += l && b && (this.showncell[idx+w-1] == "uf" || this.showncell[idx+w-1] == "om");
                mines += b && (this.showncell[idx+w] == "uf" || this.showncell[idx+w] == "om");
                mines += r && b && (this.showncell[idx+w+1] == "uf" || this.showncell[idx+w+1] == "om");

                if(mines == n){
                    l && t && this.click_action(idx-w-1);
                    t && this.click_action(idx-w);
                    r && t && this.click_action(idx-w+1);
                    l && this.click_action(idx-1);
                    r && this.click_action(idx+1);
                    l && b && this.click_action(idx+w-1);
                    b && this.click_action(idx + w);
                    r && b && this.click_action(idx+w+1);
                }
            }
        }
        return false;
    },

    timer_inc: function(){
        this.timer_elem.innerHTML = ++this.timer_value;
    }
};
