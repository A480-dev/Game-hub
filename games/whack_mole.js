export default class WhackMole {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.cols = 3;
        this.rows = 4;
        this.cellSize = 90;
        this.offsetX = 45;
        this.offsetY = 100;
        this.moles = [];
        this.score = 0;
        this.timeLeft = 30;
        this.isRunning = false;
        this.gameLoop = null;
        this.moleTimer = 0;
        this.moleInterval = 800;
    }

    start() {
        this.moles = Array(this.cols * this.rows).fill(null).map((_, i) => ({
            x: this.offsetX + (i % this.cols) * this.cellSize,
            y: this.offsetY + Math.floor(i / this.cols) * this.cellSize,
            active: false,
            whacked: false
        }));
        this.score = 0;
        this.timeLeft = 30;
        this.moleInterval = 1500;
        this.moleTimer = 0;
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

        this.moleTimer++;
        if (this.moleTimer >= this.moleInterval / (1000 / 60)) {
            this.moleTimer = 0;
            this.showMole();
        }

        if (this.moleInterval > 600) this.moleInterval -= 1;
        this.render();
    }

    showMole() {
        this.moles.forEach(m => m.active = false);
        const available = this.moles.filter(m => !m.active);
        if (available.length > 0) {
            const mole = available[Math.floor(Math.random() * available.length)];
            mole.active = true;
            mole.whacked = false;
            setTimeout(() => {
                if (mole.active && !mole.whacked) mole.active = false;
            }, 2500);
        }
    }

    whack(index) {
        const mole = this.moles[index];
        if (mole.active && !mole.whacked) {
            mole.whacked = true;
            mole.active = false;
            this.score += 10;
            this.hub.updateScore(this.score);
        }
    }

    render() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#06d6a0';
        this.ctx.font = 'bold 28px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('WHACK-A-MOLE', this.canvas.width / 2, 40);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '18px Rajdhani';
        this.ctx.fillText(`Puntos: ${this.score}`, 80, 75);
        this.ctx.fillText(`Tiempo: ${this.timeLeft}s`, 280, 75);

        this.moles.forEach((mole, i) => {
            this.ctx.fillStyle = '#1a1a25';
            this.ctx.fillRect(mole.x + 5, mole.y + 5, this.cellSize - 10, this.cellSize - 10);

            if (mole.active) {
                this.ctx.fillStyle = mole.whacked ? '#ff006e' : '#fb5607';
                this.ctx.beginPath();
                this.ctx.arc(mole.x + this.cellSize / 2, mole.y + this.cellSize / 2 + 10, 25, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.fillStyle = '#ffffff';
                this.ctx.beginPath();
                this.ctx.arc(mole.x + this.cellSize / 2 - 8, mole.y + this.cellSize / 2 + 5, 5, 0, Math.PI * 2);
                this.ctx.arc(mole.x + this.cellSize / 2 + 8, mole.y + this.cellSize / 2 + 5, 5, 0, Math.PI * 2);
                this.ctx.fill();

                this.ctx.fillStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(mole.x + this.cellSize / 2 - 8, mole.y + this.cellSize / 2 + 5, 2, 0, Math.PI * 2);
                this.ctx.arc(mole.x + this.cellSize / 2 + 8, mole.y + this.cellSize / 2 + 5, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¡FIN DEL JUEGO!', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = '20px Rajdhani';
        this.ctx.fillText(`Puntuación: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        setTimeout(() => this.hub.gameOver(this.score), 1500);
    }

    handleKeyDown(e) {}

    handleTouchStart(x, y) {
        if (!this.isRunning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const canvasX = (x - rect.left) * scaleX;
        const canvasY = (y - rect.top) * scaleY;

        this.moles.forEach((mole, i) => {
            if (canvasX > mole.x && canvasX < mole.x + this.cellSize &&
                canvasY > mole.y && canvasY < mole.y + this.cellSize) {
                this.whack(i);
            }
        });
    }

    handleTouchMove(x, y) {}

    handleTouchEnd() {}
}
