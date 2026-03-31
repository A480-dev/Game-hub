export default class Game2048 {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.size = 4;
        this.cellSize = 70;
        this.gap = 10;
        this.offsetX = 30;
        this.offsetY = 80;
        this.grid = [];
        this.score = 0;
        this.bestScore = 0;
        this.isRunning = false;
        this.gameLoop = null;
        this.colors = {
            0: '#1a1a25',
            2: '#eee4da',
            4: '#ede0c8',
            8: '#f2b179',
            16: '#f59563',
            32: '#f67c5f',
            64: '#f65e3b',
            128: '#edcf72',
            256: '#edcc61',
            512: '#edc850',
            1024: '#edc53f',
            2048: '#edc22e'
        };
    }

    start() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.score = 0;
        this.addRandomTile();
        this.addRandomTile();
        this.isRunning = true;
        this.hub.updateScore(0);
        this.render();
    }

    stop() {
        this.isRunning = false;
    }

    addRandomTile() {
        const empty = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) empty.push({ r, c });
            }
        }
        if (empty.length > 0) {
            const tile = empty[Math.floor(Math.random() * empty.length)];
            this.grid[tile.r][tile.c] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    slide(row) {
        let arr = row.filter(x => x !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                this.score += arr[i];
                arr.splice(i + 1, 1);
            }
        }
        while (arr.length < this.size) arr.push(0);
        return arr;
    }

    move(direction) {
        let moved = false;
        const oldGrid = this.grid.map(r => [...r]);
        
        if (direction === 'left' || direction === 'right') {
            for (let r = 0; r < this.size; r++) {
                if (direction === 'right') this.grid[r].reverse();
                this.grid[r] = this.slide(this.grid[r]);
                if (direction === 'right') this.grid[r].reverse();
            }
        } else {
            for (let c = 0; c < this.size; c++) {
                let col = [];
                for (let r = 0; r < this.size; r++) col.push(this.grid[r][c]);
                if (direction === 'down') col.reverse();
                col = this.slide(col);
                if (direction === 'down') col.reverse();
                for (let r = 0; r < this.size; r++) this.grid[r][c] = col[r];
            }
        }
        
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (oldGrid[r][c] !== this.grid[r][c]) moved = true;
            }
        }
        
        if (moved) {
            this.addRandomTile();
            this.hub.updateScore(this.score);
            this.render();
            
            if (this.grid.some(row => row.includes(2048))) {
                this.gameOver();
            } else if (this.grid.every(row => row.every(cell => cell !== 0))) {
                if (!this.canMove()) this.gameOver();
            }
        }
    }

    canMove() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) return true;
                if (c < this.size - 1 && this.grid[r][c] === this.grid[r][c + 1]) return true;
                if (r < this.size - 1 && this.grid[r][c] === this.grid[r + 1][c]) return true;
            }
        }
        return false;
    }

    render() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('2048', this.canvas.width / 2, 40);
        
        this.ctx.font = '14px Rajdhani';
        this.ctx.fillText(`Puntuación: ${this.score}`, this.canvas.width / 2, 65);
        
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const x = this.offsetX + c * (this.cellSize + this.gap);
                const y = this.offsetY + r * (this.cellSize + this.gap);
                const value = this.grid[r][c];
                
                this.ctx.fillStyle = this.colors[value] || '#3c3a32';
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                
                if (value !== 0) {
                    this.ctx.fillStyle = value > 4 ? '#f9f6f2' : '#776e65';
                    this.ctx.font = value < 100 ? 'bold 28px Orbitron' : value < 1000 ? 'bold 24px Orbitron' : 'bold 18px Orbitron';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(value, x + this.cellSize / 2, y + this.cellSize / 2);
                    this.ctx.textBaseline = 'alphabetic';
                }
            }
        }
    }

    gameOver() {
        this.isRunning = false;
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        setTimeout(() => this.hub.gameOver(this.score), 1000);
    }

    handleKeyDown(e) {
        if (!this.isRunning) return;
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.move('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.move('right');
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.move('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.move('down');
                break;
        }
    }

    handleTouchStart(x, y) {
        this.touchStartX = x;
        this.touchStartY = y;
    }

    handleTouchMove(x, y) {}

    handleTouchEnd() {}
}
