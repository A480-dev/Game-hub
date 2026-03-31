export default class Pacman {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.cellSize = 20;
        this.cols = 18;
        this.rows = 28;
        this.offsetX = 0;
        this.offsetY = 40;
        
        this.map = [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,1],
            [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1],
            [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1],
            [1,2,2,2,2,1,2,2,2,1,1,2,2,1,2,2,2,1],
            [1,1,1,1,2,1,1,1,0,1,1,0,1,1,2,1,1,1],
            [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0],
            [1,1,1,1,2,1,0,1,1,0,0,1,1,1,2,1,1,1],
            [1,2,2,2,2,0,0,1,0,0,0,0,1,0,0,2,2,1],
            [1,1,1,1,2,1,0,1,1,1,1,1,1,1,2,1,1,1],
            [1,1,1,1,2,1,0,0,0,0,0,0,0,1,2,1,1,1],
            [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,1],
            [1,2,1,1,2,1,1,1,2,1,1,2,1,1,1,2,1,1],
            [1,2,2,1,2,2,2,2,2,0,0,2,2,2,2,1,2,1],
            [1,1,2,1,2,1,2,1,1,1,1,1,1,2,1,2,1,1],
            [1,2,2,2,2,1,2,2,2,1,1,2,2,1,2,2,2,1],
            [1,2,1,1,1,1,1,1,2,1,1,2,1,1,1,1,1,1],
            [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ];
        
        this.player = { x: 9, y: 15, dir: 0, nextDir: 0 };
        this.ghosts = [];
        this.dots = [];
        this.score = 0;
        this.lives = 3;
        this.isRunning = false;
        this.gameLoop = null;
        this.moveTimer = 0;
        this.moveInterval = 8;
        
        this.dirs = [
            { x: 0, y: -1 },
            { x: 1, y: 0 },
            { x: 0, y: 1 },
            { x: -1, y: 0 }
        ];
    }

    start() {
        this.score = 0;
        this.lives = 3;
        this.player = { x: 9, y: 15, dir: 0, nextDir: 0 };
        this.ghosts = [
            { x: 8, y: 10, color: '#ff0000', dir: 0 },
            { x: 9, y: 10, color: '#ffb8ff', dir: 0 },
            { x: 8, y: 11, color: '#00ffff', dir: 0 },
            { x: 9, y: 11, color: '#ffb852', dir: 0 }
        ];
        
        this.dots = [];
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === 2) {
                    this.dots.push({ x, y });
                }
            }
        }
        
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

    update() {
        if (!this.isRunning) return;

        this.moveTimer++;
        if (this.moveTimer >= this.moveInterval) {
            this.moveTimer = 0;
            this.movePlayer();
            this.moveGhosts();
        }

        this.dots = this.dots.filter(dot => {
            if (dot.x === this.player.x && dot.y === this.player.y) {
                this.score += 10;
                this.hub.updateScore(this.score);
                return false;
            }
            return true;
        });

        this.ghosts.forEach(ghost => {
            if (ghost.x === this.player.x && ghost.y === this.player.y) {
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                } else {
                    this.player = { x: 9, y: 15, dir: 0, nextDir: 0 };
                }
            }
        });

        if (this.dots.length === 0) {
            this.gameOver();
        }

        this.render();
    }

    movePlayer() {
        if (this.canMove(this.player.x, this.player.y, this.player.nextDir)) {
            this.player.dir = this.player.nextDir;
        }
        
        if (this.canMove(this.player.x, this.player.y, this.player.dir)) {
            this.player.x += this.dirs[this.player.dir].x;
            this.player.y += this.dirs[this.player.dir].y;
            
            if (this.player.x < 0) this.player.x = this.cols - 1;
            if (this.player.x >= this.cols) this.player.x = 0;
        }
    }

    moveGhosts() {
        this.ghosts.forEach(ghost => {
            const possibleDirs = [];
            for (let d = 0; d < 4; d++) {
                if (this.canMove(ghost.x, ghost.y, d) && d !== (ghost.dir + 2) % 4) {
                    possibleDirs.push(d);
                }
            }
            
            if (possibleDirs.length > 0) {
                ghost.dir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
            }
            
            ghost.x += this.dirs[ghost.dir].x;
            ghost.y += this.dirs[ghost.dir].y;
            
            if (ghost.x < 0) ghost.x = this.cols - 1;
            if (ghost.x >= this.cols) ghost.x = 0;
        });
    }

    canMove(x, y, dir) {
        const nx = x + this.dirs[dir].x;
        const ny = y + this.dirs[dir].y;
        
        if (nx < 0 || nx >= this.cols) return true;
        if (ny < 0 || ny >= this.map.length) return false;
        
        return this.map[ny][nx] !== 1;
    }

    render() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.offsetX = (this.canvas.width - this.cols * this.cellSize) / 2;

        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === 1) {
                    this.ctx.fillStyle = '#1919a6';
                    this.ctx.fillRect(
                        this.offsetX + x * this.cellSize,
                        this.offsetY + y * this.cellSize,
                        this.cellSize,
                        this.cellSize
                    );
                }
            }
        }

        this.ctx.fillStyle = '#ffb897';
        this.dots.forEach(dot => {
            this.ctx.beginPath();
            this.ctx.arc(
                this.offsetX + dot.x * this.cellSize + this.cellSize / 2,
                this.offsetY + dot.y * this.cellSize + this.cellSize / 2,
                3, 0, Math.PI * 2
            );
            this.ctx.fill();
        });

        this.ctx.fillStyle = '#ffff00';
        const px = this.offsetX + this.player.x * this.cellSize + this.cellSize / 2;
        const py = this.offsetY + this.player.y * this.cellSize + this.cellSize / 2;
        this.ctx.beginPath();
        this.ctx.arc(px, py, this.cellSize / 2 - 2, 0.2 * Math.PI, 1.8 * Math.PI);
        this.ctx.lineTo(px, py);
        this.ctx.fill();

        this.ghosts.forEach(ghost => {
            this.ctx.fillStyle = ghost.color;
            const gx = this.offsetX + ghost.x * this.cellSize + this.cellSize / 2;
            const gy = this.offsetY + ghost.y * this.cellSize + this.cellSize / 2;
            this.ctx.beginPath();
            this.ctx.arc(gx, gy, this.cellSize / 2 - 2, Math.PI, 0);
            this.ctx.lineTo(gx + this.cellSize / 2 - 2, gy + this.cellSize / 2 - 2);
            this.ctx.lineTo(gx - this.cellSize / 2 + 2, gy + this.cellSize / 2 - 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(gx - 4, gy - 2, 3, 0, Math.PI * 2);
            this.ctx.arc(gx + 4, gy - 2, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Orbitron';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Puntos: ${this.score}`, 10, 25);
        this.ctx.fillText(`Vidas: ${this.lives}`, 280, 25);
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffff00';
        this.ctx.font = 'bold 28px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        setTimeout(() => this.hub.gameOver(this.score), 1000);
    }

    handleKeyDown(e) {
        if (!this.isRunning) return;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.player.nextDir = 0;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.player.nextDir = 1;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.player.nextDir = 2;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.player.nextDir = 3;
                break;
        }
    }

    handleTouchStart(x, y) {
        this.touchStartX = x;
    }

    handleTouchMove(x, y) {
        if (!this.isRunning || !this.touchStartX) return;
        
        const dx = x - this.touchStartX;
        if (Math.abs(dx) > 0.08) {
            if (dx > 0) this.player.nextDir = 1;
            else this.player.nextDir = 3;
            this.touchStartX = x;
        }
    }

    handleTouchEnd() {}
}
