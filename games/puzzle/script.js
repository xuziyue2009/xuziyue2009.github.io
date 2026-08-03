/**
 * 15-Puzzle (数字华容道) — 4×4 sliding puzzle
 * Loaded by games/puzzle/index.html
 */
(function() {
    'use strict';

    var SIZE = 4;
    var board = [];
    var moveCount = 0;
    var emptyRow = SIZE - 1;
    var emptyCol = SIZE - 1;
    var gameOver = false;

    var boardEl = document.getElementById('puzzle-board');
    var moveCountEl = document.getElementById('move-count');
    var msgEl = document.getElementById('puzzle-msg');

    function initBoard() {
        board = [];
        for (var r = 0; r < SIZE; r++) {
            board[r] = [];
            for (var c = 0; c < SIZE; c++) {
                var val = r * SIZE + c + 1;
                board[r][c] = val < SIZE * SIZE ? val : 0;
            }
        }
        emptyRow = SIZE - 1;
        emptyCol = SIZE - 1;
        moveCount = 0;
        gameOver = false;
        if (msgEl) msgEl.textContent = '';
        updateMoveDisplay();
    }

    function updateMoveDisplay() {
        if (moveCountEl) moveCountEl.textContent = moveCount;
    }

    function render() {
        if (!boardEl) return;
        boardEl.innerHTML = '';
        for (var r = 0; r < SIZE; r++) {
            for (var c = 0; c < SIZE; c++) {
                var tile = document.createElement('div');
                tile.className = 'puzzle-tile';
                if (board[r][c] === 0) {
                    tile.classList.add('empty');
                } else {
                    tile.textContent = board[r][c];
                }
                tile.dataset.row = r;
                tile.dataset.col = c;
                tile.addEventListener('click', tileClick);
                boardEl.appendChild(tile);
            }
        }
    }

    function isAdjacent(r1, c1, r2, c2) {
        return (Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1;
    }

    function tileClick(e) {
        if (gameOver) return;
        var r = parseInt(e.currentTarget.dataset.row);
        var c = parseInt(e.currentTarget.dataset.col);
        if (board[r][c] === 0) return;

        if (isAdjacent(r, c, emptyRow, emptyCol)) {
            board[emptyRow][emptyCol] = board[r][c];
            board[r][c] = 0;
            emptyRow = r;
            emptyCol = c;
            moveCount++;
            updateMoveDisplay();
            render();
            checkWin();
        }
    }

    function getValidMoves() {
        var moves = [];
        var dirs = [[-1,0],[1,0],[0,-1],[0,1]];
        for (var d = 0; d < dirs.length; d++) {
            var nr = emptyRow + dirs[d][0];
            var nc = emptyCol + dirs[d][1];
            if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                moves.push([nr, nc]);
            }
        }
        return moves;
    }

    function applyMove(move) {
        var r = move[0], c = move[1];
        board[emptyRow][emptyCol] = board[r][c];
        board[r][c] = 0;
        emptyRow = r;
        emptyCol = c;
    }

    function isSolved() {
        for (var r = 0; r < SIZE; r++) {
            for (var c = 0; c < SIZE; c++) {
                var expected = r * SIZE + c + 1;
                if (expected < SIZE * SIZE && board[r][c] !== expected) return false;
            }
        }
        return board[SIZE-1][SIZE-1] === 0;
    }

    function checkWin() {
        if (isSolved()) {
            gameOver = true;
            if (msgEl) msgEl.textContent = '🎉 恭喜！你用 ' + moveCount + ' 步完成了拼图！';
        }
    }

    function shuffle() {
        initBoard();
        var lastMove = -1;
        for (var i = 0; i < 200; i++) {
            var moves = getValidMoves();
            var move;
            do {
                move = moves[Math.floor(Math.random() * moves.length)];
            } while (moves.length > 1 && move === lastMove);
            lastMove = move;
            applyMove(move);
        }
        if (isSolved()) {
            var extra = getValidMoves();
            applyMove(extra[0]);
        }
        moveCount = 0;
        gameOver = false;
        if (msgEl) msgEl.textContent = '';
        updateMoveDisplay();
        render();
    }

    function reset() {
        initBoard();
        render();
    }

    // Bind controls
    var shuffleBtn = document.getElementById('puzzle-shuffle');
    var resetBtn = document.getElementById('puzzle-reset');
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffle);
    if (resetBtn) resetBtn.addEventListener('click', reset);

    initBoard();
    render();
})();
