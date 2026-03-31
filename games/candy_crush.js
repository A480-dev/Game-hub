export default class CandyCrush {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.rows = 8;
        this.cols = 6;
        this.cellSize = 55;
        this.offsetX = 15;
        this.offsetY = 80;
        this.grid = [];
        this.score = 0;
        this.isRunning = false;
        this.candies = ['🔴', '🟠', '🟡', '🟢', '🔵', '🟣'];
    }

    start() {
        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.grid[r][c] = Math.floor(Math.random() * this.candies.length);
            }
        }
        this.score = 0;
        this.isRunning = true;
        this.hub.updateScore(0);
        this.checkMatches();
        this.render();
    }

    stop() { this.isRunning = false; }

    checkMatches() {
        let matched = false;
        
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols - 2; c++) {
                if (this.grid[r][c] === this.grid[r][c+1] && 
                    this.grid[r][c] === this.grid[r][c+2]) {
                    this.grid[r][c] = -1;
                    this.grid[r][c+1] = -1;
                    this.grid[r][c+2] = -1;
                    matched = true;
                }
            }
        }
        
        for (let c = 0; c < this.cols; c++) {
            for (let r = 0; r < this.rows - 2; r++) {
                if (this.grid[r][c] === this.grid[r+1][c] && 
                    this.grid[r][c] === this.grid[r+2][c]) {
                    this.grid[r][c] = -1;
                    this.grid[r+1][c] = -1;
                    this.grid[r+2][c] = -1;
                    matched = true;
                }
            }
        }
        
        if (matched) {
            this.score += 30;
            this.hub.updateScore(this.score);
            this.dropCandies();
            setTimeout(() => this.checkMatches(), 200);
        }
    }

    dropCandies() {
        for (let c = 0; c < this.cols; c++) {
            let empty = [];
            for (let r = this.rows - 1; r >= 0; r--) {
                if (this.grid[r][c] === -1) {
                    empty.push(r);
                } else if (empty.length > 0) {
                    const target = empty.shift();
                    this.grid[target][c] = this.grid[r][c];
                    this.grid[r][c] = -1;
                    empty.unshift(r);
                }
            }
            empty.forEach(r => {
                this.grid[r][c] = Math.floor(Math.random() * this.candies.length);
            });
        }
        this.render();
    }

    swap(r1, c1, r2, c2) {
        const temp = this.grid[r1][c1];
        this.grid[r1][c1] = this.grid[r2][c2];
        this.grid[r2][c2] = temp;
        this.checkMatches();
    }

    render() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 24px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('CANDY CRUSH', this.canvas.width / 2, 40);

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const x = this.offsetX + c * this.cellSize;
                const y = this.offsetY + r * this.cellSize;
                
                this.ctx.fillStyle = '#1a1a25';
                this.ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
                
                if (this.grid[r][c] >= 0) {
                    this.ctx.font = '28px sans-serif';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(
                        this.candies[this.grid[r][c]],
                        x + this.cellSize / 2,
                        y + this.cellSize / 2
                    );
                }
            }
        }

        this.ctx.fillStyle = '#ff006e';
        this.ctx.font = '16px Orbitron';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Puntos: ${this.score}`, 10, 620);
    }

    handleKeyDown(e) {}

    handleTouchStart(x, y) {
        const c = Math.floor((x - this.offsetX) / this.cellSize);
        const r = Math.floor((y - this.offsetY) / this.cellSize);
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            if (!this.selected) {
                this.selected = { r, c };
            } else {
                const dr = Math.abs(r - this.selected.r);
                const dc = Math.abs(c - this.selected.c);
                if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
                    this.swap(this.selected.r, this.selected.c, r, c);
                }
                this.selected = null;
            }
        }
    }
    handleTouchMove(x, y) {}
    handleTouchEnd() {}
}
