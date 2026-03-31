export default class Sudoku {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.cellSize = 38;
        this.offsetX = 10;
        this.offsetY = 60;
        this.grid = [];
        this.solution = [];
        this.selected = null;
        this.score = 0;
        this.mistakes = 0;
        this.isRunning = false;
    }

    start() {
        this.generatePuzzle();
        this.selected = null;
        this.score = 0;
        this.mistakes = 0;
        this.isRunning = true;
        this.hub.updateScore(0);
        this.render();
    }

    stop() { this.isRunning = false; }

    generatePuzzle() {
        this.solution = Array(9).fill(null).map(() => Array(9).fill(0));
        this.fillDiagonal();
        this.solve(this.solution);
        
        this.grid = this.solution.map(row => [...row]);
        const attempts = 40;
        for (let i = 0; i < attempts; i++) {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            if (this.grid[r][c] !== 0) {
                this.grid[r][c] = 0;
            }
        }
    }

    fillDiagonal() {
        for (let i = 0; i < 9; i += 3) {
            this.fillBox(i, i);
        }
    }

    fillBox(row, col) {
        let num;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                do { num = Math.floor(Math.random() * 9) + 1; } while (!this.isSafeBox(row, col, num));
                this.solution[row + i][col + j] = num;
            }
        }
    }

    isSafeBox(rowStart, colStart, num) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (this.solution[rowStart + i][colStart + j] === num) return false;
            }
        }
        return true;
    }

    solve(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (this.isSafe(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (this.solve(grid)) return true;
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    isSafe(grid, row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num || grid[x][col] === num) return false;
        }
        const startRow = row - row % 3;
        const startCol = col - col % 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[startRow + i][startCol + j] === num) return false;
            }
        }
        return true;
    }

    selectCell(x, y) {
        const col = Math.floor((x - this.offsetX) / this.cellSize);
        const row = Math.floor((y - this.offsetY) / this.cellSize);
        if (row >= 0 && row < 9 && col >= 0 && col < 9 && this.grid[row][col] !== 0) {
            this.selected = { row, col };
            this.render();
        }
    }

    fillNumber(num) {
        if (!this.selected) return;
        const { row, col } = this.selected;
        if (this.solution[row][col] === num) {
            this.grid[row][col] = num;
            this.score += 10;
            this.hub.updateScore(this.score);
            if (this.checkWin()) this.gameOver();
        } else {
            this.mistakes++;
            if (this.mistakes >= 3) this.gameOver();
        }
        this.render();
    }

    checkWin() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] !== this.solution[row][col]) return false;
            }
        }
        return true;
    }

    render() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SUDOKU', this.canvas.width / 2, 35);

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const x = this.offsetX + col * this.cellSize;
                const y = this.offsetY + row * this.cellSize;
                
                this.ctx.fillStyle = (row + col) % 2 === 0 ? '#1a1a25' : '#222230';
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

                if (this.selected && this.selected.row === row && this.selected.col === col) {
                    this.ctx.fillStyle = '#00f5d4';
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                }

                if (this.grid[row][col] !== 0) {
                    this.ctx.fillStyle = this.grid[row][col] === this.solution[row][col] ? '#fff' : '#ff006e';
                    this.ctx.font = 'bold 18px Orbitron';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(this.grid[row][col], x + this.cellSize / 2, y + this.cellSize / 2);
                }
            }
        }

        this.ctx.strokeStyle = '#00f5d4';
        this.ctx.lineWidth = 2;
        for (let i = 0; i <= 9; i++) {
            this.ctx.lineWidth = i % 3 === 0 ? 3 : 1;
            this.ctx.beginPath();
            this.ctx.moveTo(this.offsetX + i * this.cellSize, this.offsetY);
            this.ctx.lineTo(this.offsetX + i * this.cellSize, this.offsetY + 9 * this.cellSize);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(this.offsetX, this.offsetY + i * this.cellSize);
            this.ctx.lineTo(this.offsetX + 9 * this.cellSize, this.offsetY + i * this.cellSize);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = '#606070';
        this.ctx.font = '14px Rajdhani';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Errores: ${this.mistakes}/3`, 10, 600);
    }

    gameOver() {
        this.isRunning = false;
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#00f5d4';
        this.ctx.font = 'bold 28px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.checkWin() ? '¡COMPLETO!' : 'GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        setTimeout(() => this.hub.gameOver(this.score), 1000);
    }

    handleKeyDown(e) {
        if (!this.isRunning || !this.selected) return;
        const num = parseInt(e.key);
        if (num >= 1 && num <= 9) this.fillNumber(num);
    }

    handleTouchStart(x, y) {
        this.selectCell(x, y);
    }
    handleTouchMove(x, y) {}
    handleTouchEnd() {}
}
