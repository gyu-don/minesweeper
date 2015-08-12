var game;
window.onload = function() {
    game = new Game(30, 16, 99, document.getElementById("main"));
    document.getElementById('in_w').value = game.width;
    document.getElementById('in_h').value = game.height;
    document.getElementById('in_n').value = game.mines;
};
