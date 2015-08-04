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
    is_firstclick: true,

    reset: function(){
        function get_cellstring(width, height, mines, len){
            var i, j;
            var str;
            var l, r, t, b;

            minemap = new Array(len);
            for(i=0;i<mines;i++) minemap[i] = 1;
            for(i=mines;i<len;i++) minemap[i] = 0;
            // shuffle
            for(i=len-1,j,t;i>0;i--){
                j = Math.floor(Math.random() * (i + 1));
                t = minemap[i];
                minemap[i] = minemap[j];
                minemap[j] = t;
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

        this.cellstring = get_cellstring(this.width, this.height, this.mines, len);
        this.showncell = new Array(len);
        for(i=0;i<len;i++) this.showncell[i] = "u0";
        this.left_mines = this.mines;
	this.left_non_mines = len - this.mines;
        this.is_firstclick = true;
        clearInterval(this.timer_id);
        this.timer_value = 0;
        this.draw();
    },

    draw: function(){
        var i, x, y;
        var sc = this.showncell;
        var c = this.cellstring;
        var len = this.height * this.width;

        str = '<div class="board"><div class="counter">' + this.mines + '</div><div class="timer">0</div>' +
            '<button class="minereset"></button><table>';
        for(i=0,y=0;y<this.height;y++){
            str += '<tr>';
            for(x=0;x<this.width;x++,i++){
                str += '<td class="' + sc[i] + '" ' + '>' + this.get_innertext(sc[i]) + '</td>';
            }
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

    get_innertext: function(item){
        if(item[1] == "0") return "";
        else if(!isNaN(parseInt(item[1]))) return item[1];
        else if(item == "uf") return "&#x2691;";
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
        var visited = this.showncell[idx][0] == "o";
        var is_flagged = this.showncell[idx] == "uf";
        var l, r, t, b, w = this.width, h = this.height;

        if(this.is_firstclick){
            while(this.cellstring[idx] != "0") this.reset();
            this.timer_id = setInterval(this.timer_inc.bind(this), 1000);
            this.is_firstclick = false;
        }
        if(!visited && !is_flagged){
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

var game;
window.onload = function() {
    game = new Game(30, 16, 99, document.getElementById("main"));
    document.getElementById('in_w').value = game.width;
    document.getElementById('in_h').value = game.height;
    document.getElementById('in_n').value = game.mines;
};
