export default class Tetris {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.cols = 10;
        this.rows = 20;
        this.cellSize = 28;
        this.offsetX = 30;
        this.offsetY = 40;
        this.board = [];
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.isRunning = false;
        this.gameLoop = null;
        
        this.shapes = [
            [[1,1,1,1]],
            [[1,1],[1,1]],
            [[1,1,1],[0,1,0]],
            [[1,1,1],[1,0,0]],
            [[1,1,1],[0,0,1]],
            [[1,1,0],[0,1,1]],
            [[0,1,1],[1,1,0]]
        ];
        
        this.colors = ['#00f5d4', '#ff006e', '#8338ec', '#ffbe0b', '#3a86ff', '#06d6a0', '#fb5607'];
        this.currentPiece = null;
        this.dropCounter = 0;
        this.dropInterval = 800;
    }

    start() {
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.gameOver = false;
        this.dropInterval = 800;
        this.spawnPiece();
        this.isRunning = true;
        this.hub.updateScore(0);
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
    }

    stop() {
        this.isRunning = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
    }

    spawnPiece() {
        const idx = Math.floor(Math.random() * this.shapes.length);
        const shape = this.shapes[idx];
        this.currentPiece = {
            shape: shape.map(row => [...row]),
            color: this.colors[idx],
            x: Math.floor(this.cols / 2) - Math.floor(shape[0].length / 2),
            y: 0
        };
        
        if (this.checkCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.shape)) {
            this.gameOver = true;
            this.stop();
            this.render();
            setTimeout(() => this.hub.gameOver(this.score), 500);
        }
    }

    checkCollision(x, y, shape) {
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    if (newX < 0 || newX >= this.cols || newY >= this.rows) return true;
                    if (newY >= 0 && this.board[newY][newX]) return true;
                }
            }
        }
        return false;
    }

    rotate(shape) {
        const rows = shape.length;
        const cols = shape[0].length;
        const rotated = Array(cols).fill(null).map(() => Array(rows).fill(0));
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                rotated[col][rows - 1 - row] = shape[row][col];
            }
        }
        return rotated;
    }

    merge() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const y = this.currentPiece.y + row;
                    const x = this.currentPiece.x + col;
                    if (y >= 0) this.board[y][x] = this.currentPiece.color;
                }
            }
        }
    }

    clearLines() {
        let cleared = 0;
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.board[row].every(cell => cell !== 0)) {
                this.board.splice(row, 1);
                this.board.unshift(Array(this.cols).fill(0));
                cleared++;
                row++;
            }
        }
        
        if (cleared > 0) {
            this.lines += cleared;
            this.score += [0, 100, 300, 500, 800][cleared] * this.level;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropInterval = Math.max(100, 800 - (this.level - 1) * 100);
            this.hub.updateScore(this.score);
        }
    }

    update() {
        if (!this.isRunning || this.gameOver) return;
        
        this.dropCounter++;
        if (this.dropCounter >= this.dropInterval / (1000 / 60)) {
            this.dropCounter = 0;
            this.moveDown();
        }
        this.render();
    }

    moveDown() {
        if (this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
            this.merge();
            this.clearLines();
            this.spawnPiece();
        } else {
            this.currentPiece.y++;
        }
    }

    moveLeft() {
        if (!this.checkCollision(this.currentPiece.x - 1, this.currentPiece.y, this.currentPiece.shape)) {
            this.currentPiece.x--;
        }
    }

    moveRight() {
        if (!this.checkCollision(this.currentPiece.x + 1, this.currentPiece.y, this.currentPiece.shape)) {
            this.currentPiece.x++;
        }
    }

    rotatePiece() {
        const rotated = this.rotate(this.currentPiece.shape);
        if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y, rotated)) {
            this.currentPiece.shape = rotated;
        } else if (!this.checkCollision(this.currentPiece.x - 1, this.currentPiece.y, rotated)) {
            this.currentPiece.x--;
            this.currentPiece.shape = rotated;
        } else if (!this.checkCollision(this.currentPiece.x + 1, this.currentPiece.y, rotated)) {
            this.currentPiece.x++;
            this.currentPiece.shape = rotated;
        }
    }

    hardDrop() {
        while (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.shape)) {
            this.currentPiece.y++;
            this.score += 2;
        }
        this.hub.updateScore(this.score);
        this.merge();
        this.clearLines();
        this.spawnPiece();
    }

    render() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col]) {
                    this.ctx.fillStyle = this.board[row][col];
                    this.ctx.fillRect(
                        this.offsetX + col * this.cellSize,
                        this.offsetY + row * this.cellSize,
                        this.cellSize - 2,
                        this.cellSize - 2
                    );
                } else {
                    this.ctx.fillStyle = 'rgba(255,255,255,0.05)';
                    this.ctx.fillRect(
                        this.offsetX + col * this.cellSize,
                        this.offsetY + row * this.cellSize,
                        this.cellSize - 2,
                        this.cellSize - 2
                    );
                }
            }
        }
        
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            for (let row = 0; row < this.currentPiece.shape.length; row++) {
                for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                    if (this.currentPiece.shape[row][col]) {
                        this.ctx.fillRect(
                            this.offsetX + (this.currentPiece.x + col) * this.cellSize,
                            this.offsetY + (this.currentPiece.y + row) * this.cellSize,
                            this.cellSize - 2,
                            this.cellSize - 2
                        );
                    }
                }
            }
        }
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Orbitron';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Puntos: ${this.score}`, 10, 25);
        this.ctx.fillText(`Nivel: ${this.level}`, 150, 25);
    }

    handleKeyDown(e) {
        if (!this.isRunning) return;
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.moveLeft();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.moveRight();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.moveDown();
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
            case ' ':
                this.rotatePiece();
                break;
            case 'Enter':
                this.hardDrop();
                break;
        }
    }

    handleTouchStart(x, y) {
        this.touchStartX = x;
    }

    handleTouchMove(x, y) {
        if (!this.isRunning || !this.touchStartX) return;
        
        const dx = x - this.touchStartX;
        if (Math.abs(dx) > 0.05) {
            if (dx > 0) this.moveRight();
            else this.moveLeft();
            this.touchStartX = x;
        }
    }

    handleTouchEnd() {
        this.touchStartX = null;
    }
}
