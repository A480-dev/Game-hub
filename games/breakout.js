export default class Breakout {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.paddle = { x: 130, y: 600, width: 100, height: 12, speed: 8 };
        this.ball = { x: 180, y: 580, vx: 3, vy: -3, radius: 6 };
        this.bricks = [];
        this.score = 0;
        this.lives = 3;
        this.isRunning = false;
        this.gameLoop = null;
        this.colors = {
            bg: '#0a0a0f',
            paddle: '#00f5d4',
            ball: '#ffffff',
            brickColors: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff', '#06d6a0']
        };
    }

    start() {
        this.paddle = { x: 130, y: 600, width: 100, height: 12, speed: 8 };
        this.ball = { x: 180, y: 580, vx: 3, vy: -3, radius: 6 };
        this.score = 0;
        this.lives = 3;
        this.createBricks();
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

    createBricks() {
        this.bricks = [];
        const rows = 6;
        const cols = 9;
        const padding = 4;
        const brickWidth = (this.canvas.width - padding * (cols + 1)) / cols;
        const brickHeight = 18;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.bricks.push({
                    x: padding + col * (brickWidth + padding),
                    y: 60 + row * (brickHeight + padding),
                    width: brickWidth,
                    height: brickHeight,
                    color: this.colors.brickColors[row],
                    alive: true
                });
            }
        }
    }

    update() {
        if (!this.isRunning) return;

        this.paddle.x += this.paddle.dx || 0;
        this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, this.paddle.x));

        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        if (this.ball.x - this.ball.radius < 0 || this.ball.x + this.ball.radius > this.canvas.width) {
            this.ball.vx *= -1;
        }
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.vy *= -1;
        }

        if (this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.x > this.paddle.x && this.ball.x < this.paddle.x + this.paddle.width) {
            this.ball.vy = -Math.abs(this.ball.vy);
            const hitPos = (this.ball.x - this.paddle.x) / this.paddle.width;
            this.ball.vx = (hitPos - 0.5) * 6;
        }

        for (let brick of this.bricks) {
            if (!brick.alive) continue;
            if (this.ball.x > brick.x && this.ball.x < brick.x + brick.width &&
                this.ball.y > brick.y && this.ball.y < brick.y + brick.height) {
                brick.alive = false;
                this.ball.vy *= -1;
                this.score += 10;
                this.hub.updateScore(this.score);
                break;
            }
        }

        if (this.ball.y > this.canvas.height) {
            this.lives--;
            if (this.lives <= 0) {
                this.gameOver();
                return;
            }
            this.ball = { x: 180, y: 580, vx: 3, vy: -3, radius: 6 };
        }

        if (this.bricks.every(b => !b.alive)) {
            this.createBricks();
            this.ball.vx *= 1.1;
            this.ball.vy *= 1.1;
        }

        this.render();
    }

    render() {
        this.ctx.fillStyle = this.colors.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let brick of this.bricks) {
            if (!brick.alive) continue;
            this.ctx.fillStyle = brick.color;
            this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        }

        this.ctx.fillStyle = this.colors.paddle;
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

        this.ctx.fillStyle = this.colors.ball;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Orbitron, sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Puntos: ${this.score}`, 10, 30);
        this.ctx.fillText(`Vidas: ${this.lives}`, this.canvas.width - 80, 30);
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '20px Rajdhani, sans-serif';
        this.ctx.fillText(`Puntuación: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        setTimeout(() => this.hub.gameOver(this.score), 1000);
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                this.paddle.dx = -this.paddle.speed;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.paddle.dx = this.paddle.speed;
                break;
            case ' ':
                if (!this.isRunning) this.start();
                break;
        }
    }

    handleKeyUp(e) {
        if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && this.paddle.dx < 0) {
            this.paddle.dx = 0;
        }
        if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && this.paddle.dx > 0) {
            this.paddle.dx = 0;
        }
    }

    handleTouchStart(x, y) {
        this.touchX = x;
    }

    handleTouchMove(x, y) {
        const paddleX = x * this.canvas.width - this.paddle.width / 2;
        this.paddle.x = Math.max(0, Math.min(this.canvas.width - this.paddle.width, paddleX));
    }

    handleTouchEnd() {}
}
