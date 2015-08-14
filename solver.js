function Solver(width, height, mines, draw_to){
    function Hints(solver){
	this.solver = solver;
    }
    Hints.prototype = this.hints_prototype;

    this.hints = new Hints(this);

    this.width = width;
    this.height = height;
    this.mines = mines;
    this.draw_to = draw_to;

    if(!this.game_validity()) return null;
    this.reset()
}

Solver.prototype = Object.create(Game.prototype);
Solver.prototype.game = Game.prototype;

Solver.prototype.hints_prototype = {
    reset: function(){
	var i, n;

	n = this.solver.width * this.solver.height;
	this.indices = [new Array(n)];
	this.mines = [this.solver.mines];
	this.n_hints = 1;
	this.dirty = 0;
	for(i=0;i<n;i++) this.indices[0][i] = i;
    },

    add: function(indices, mines, is_recursion){
	var i, cross, a, b, n, t;

	if(mines > 1 && indices.length == mines){
	    for(i=0;i<mines;i++) this.add([indices[i]], 1, is_recursion);
	}
	else if(mines == 0 && indices.length > 1){
	    for(i=0;i<indices.length;i++) this.add([indices[i]], 0, is_recursion);
	}
	else{
	    for(i=0;i<this.mines.length;i++){
		cross = this.get_intersection(this.indices[i], indices);
		if(cross.length){
		    a = this.get_complement(this.indices[i], cross);
		    b = this.get_complement(indices, cross);
		    if(!a.length){
			if(b.length) this.add(b, mines - this.mines[i], is_recursion);
			return;
		    }
		    else if(!b.length){
			t = this.mines[i] - mines;
			this.mines[i] = 0;
			this.indices[i] = new Array();
			this.dirty++;
			this.add(a, t, true);
		    }
		    else{
			n = Math.max(0, this.mines[i] - a.length, mines - b.length);
			if(n == Math.min(cross.length, this.mines[i], mines)){
			    t = this.mines[i] - n;
			    this.mines[i] = 0;
			    this.indices[i] = new Array();
			    this.dirty++;
			    this.add(a, t, true);
			    this.add(cross, n, true);
			    this.add(b, mines - n, is_recursion);
			    return;
			}
		    }
		}
	    }
	    this.mines.push(mines);
	    this.indices.push(indices);
	    if(!is_recursion && this.dirty > 50) this.cleanup();
	}
    },

    open: function(idx, cellstring){
	if(cellstring == '*') this.add([idx], 1);
	else{
	    this.add([idx], 0);
	    this.add(this.with_around(idx), parseInt(cellstring));
	}
    },

    with_around: function(idx){
	var width = this.solver.width, height = this.solver.height;
	var l, r, t, b;
	var a = new Array();

	l = (idx % width) > 0;
	r = (idx % width) < width - 1;
	t = idx > width - 1;
	b = idx < (height - 1) * width;

	t && l && a.push(idx - width - 1);
	t && a.push(idx - width);
	t && r && a.push(idx - width + 1);
	l && a.push(idx - 1);
	//a.push(idx);
	r && a.push(idx + 1);
	b && l && a.push(idx + width - 1);
	b && a.push(idx + width);
	b && r && a.push(idx + width + 1);

	return a;
    },

    get_intersection: function(a, b){
	var ai, bi, intersection = new Array();

	for(ai=bi=0;ai<a.length&&bi<b.length;){
	    if(a[ai] < b[bi]) ai++;
	    else if(a[ai] > b[bi]) bi++;
	    else{
		intersection.push(a[ai]);
		ai++;
		bi++;
	    }
	}
	return intersection;
    },

    get_complement: function(a, b){
	var ai, bi, complement = new Array();

	for(ai=bi=0;ai<a.length&&bi<b.length;){
	    if(b[bi] < a[ai]) bi++;
	    else if(a[ai] < b[bi]) complement.push(a[ai++]);
	    else{ ai++; bi++; }
	}
	for(;ai<a.length;) complement.push(a[ai++]);
	return complement;
    },

    cleanup: function(a, b){
	var i, clean_mines = new Array(), clean_indices = new Array();

	for(i=0;i<this.mines.length;i++){
	    if(this.indices[i].length){
		clean_mines.push(this.mines[i]);
		clean_indices.push(this.indices[i]);
	    }
	}
	this.mines = clean_mines;
	this.indices = clean_indices;
	this.dirty = 0;
    },

    /* For debug. */
    query: function(x, y){
	var i, s='';
	if(y) x += y * this.solver.width;
	for(i=0;i<this.mines.length;i++){
	    if(this.indices[i].indexOf(x) != -1) s += i+': { '+this.indices[i]+' } '+this.mines[i]+'\n';
	}
	return s;
    }
}

Solver.prototype.reset = function(){
    this.game.reset.call(this);
    this.reset_called();
}

Solver.prototype.open_cell = function(idx){
    this.game.open_cell.call(this, idx);
    this.open_cell_called(idx);
}

Solver.prototype.reset_called = function(){
    this.hints.reset();
}

Solver.prototype.open_cell_called = function(idx){
    var c = this.cellstring[idx];

    this.hints.open(idx, c);
}

Solver.prototype.solve = function(){
    var i, idx, changed = false;

    for(i=0;i<this.hints.indices.length;i++){
	if(this.hints.indices[i].length == 1){
	    idx = this.hints.indices[i][0];
	    if(this.showncell[idx][0] == 'u'){
		if(this.hints.mines[i] == 0){
		    if(this.showncell[idx][1] == 'f') this.rightclick_action(idx);
		    changed = true;
		    this.click_action(idx);
		}
		else{
		    if(this.showncell[idx][1] == '0') this.rightclick_action(idx);
		}
	    }
	}
    }
    if(changed) this.solve();
}

var game;
window.onload = function() {
    game = new Solver(30, 16, 99, document.getElementById("main"));
    document.getElementById('in_w').value = game.width;
    document.getElementById('in_h').value = game.height;
    document.getElementById('in_n').value = game.mines;
};
