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
        const n = this.solver.width * this.solver.height;
        this.indices = [new Array(n)];
        this.mines = [this.solver.mines];
        this.n_hints = 1;
        this.dirty = 0;
        for(let i=0;i<n;i++) this.indices[0][i] = i;
    },

    add: function(indices, mines, is_recursion){
        let cross, n, t;

        if(mines > 1 && indices.length == mines){
            for(let i=0;i<mines;i++) this.add([indices[i]], 1, is_recursion);
        }
        else if(mines == 0 && indices.length > 1){
            for(let i=0;i<indices.length;i++) this.add([indices[i]], 0, is_recursion);
        }
        else{
            for(let i=0;i<this.mines.length;i++){
                cross = intersection(this.indices[i], indices);
                if(cross.length){
                    const a = complement(this.indices[i], cross);
                    const b = complement(indices, cross);
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
        const width = this.solver.width;
        const height = this.solver.height;
        return around(width, height, idx);
    },

    cleanup: function(a, b){
        let clean_mines = new Array(), clean_indices = new Array();

        for(let i=0;i<this.mines.length;i++){
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
        let s='';
        if(y) x += y * thisasolver.width;
        for(let i = 0; i < this.mines.length; i++){
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

function ProbSolver(width, height, mines, draw_to){
    Solver.call(this, width, height, mines, draw_to);
    this.show_prob = false;
}

ProbSolver.prototype = Object.create(Solver.prototype);

ProbSolver.prototype.click_action = function(idx) {
    this.show_prob = false;
    this.game.click_action.call(this, idx);
    this.draw_prob();
    return false;
}

ProbSolver.prototype.rightclick_action = function(idx) {
    this.show_prob = false;
    this.game.rightclick_action.call(this, idx);
    this.draw_prob();
    return false;
}

ProbSolver.prototype.doubleclick_action = function(idx) {
    this.show_prob = false;
    this.game.doubleclick_action.call(this, idx);
    this.draw_prob();
    return false;
}

ProbSolver.prototype.reset = function(idx) {
    this.show_prob = false;
    Solver.prototype.reset.call(this, idx);
    return false;
}

ProbSolver.prototype.calc_prob = function() {
    const unopened = this.get_unopened();
    const orphans = this.get_orphans();
    const edges = complement(unopened, orphans);
    const mines = this.get_mines();
    const left_mines = this.left_mines;
    let dict = {};
    edges.forEach(idx => dict[idx] = 0.999);
    console.log(this.hints);
    return [dict, left_mines / unopened.length];
}

ProbSolver.prototype.draw_prob = function() {
    const len = this.width * this.height;
    const tds = this.draw_to.getElementsByTagName('td');
    if (!this.show_prob) {
        for (let i = 0; i < len; i++) {
            if (this.showncell[i][0] != 'u') continue;
            tds[i].innerHTML = '';
        }
        return;
    }
    const [p_dict, p_nohint] = this.calc_prob();
    for (let i = 0; i < len; i++) {
        if (this.showncell[i] != 'u0') continue;
        const p = (i in p_dict) ? p_dict[i] : p_nohint;
        tds[i].innerHTML = '<span class="prob">.' + ('000' + Math.round(p * 1000)).slice(-3) + '</span>';
    }
}

ProbSolver.prototype.activate_calc_prob = function() {
    this.show_prob = true;
    this.draw_prob();
}

ProbSolver.prototype.get_unopened = function() {
    const len = this.width * this.height;
    return range(len).filter(i => this.showncell[i] == 'u0');
}

ProbSolver.prototype.get_orphans = function() {
    const width = this.width;
    const height = this.height;
    const len = width * height;
    return range(len).filter(i => this.showncell[i] == 'u0' &&
            around(width, height, i).every(idx => this.showncell[idx][0] == 'u')
    );
}

ProbSolver.prototype.get_mines = function() {
    return range(this.width * this.height).filter(i => this.showncell[i] == 'uf' || this.showncell[i] == 'om');
}

var game;
window.onload = function() {
    game = new ProbSolver(30, 16, 99, document.getElementById("main"));
    document.getElementById('in_w').value = game.width;
    document.getElementById('in_h').value = game.height;
    document.getElementById('in_n').value = game.mines;
};
