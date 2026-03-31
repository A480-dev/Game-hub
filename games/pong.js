export default class Pong {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.ball = { x: 180, y: 320, vx: 4, vy: 3, radius: 8 };
        this.paddle1 = { x: 20, y: 280, width: 12, height: 80, score: 0 };
        this.paddle2 = { x: 328, y: 280, width: 12, height: 80, score: 0 };
        this.paddleAI = { x: 328, y: 280, width: 12, height: 80, score: 0 };
        this.isRunning = false;
        this.gameLoop = null;
        this.colors = {
            bg: '#0a0a0f',
            paddle1: '#00f5d4',
            paddle2: '#ff006e',
            ball: '#ffffff',
            net: 'rgba(255,255,255,0.1)',
            text: '#ffffff'
        };
    }

    start() {
        this.ball = { x: 180, y: 320, vx: 4, vy: 3, radius: 8 };
        this.paddle1 = { x: 20, y: 280, width: 12, height: 80, score: 0 };
        this.paddle2 = { x: 328, y: 280, width: 12, height: 80, score: 0 };
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

        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        if (this.ball.y - this.ball.radius < 0 || this.ball.y + this.ball.radius > this.canvas.height) {
            this.ball.vy *= -1;
        }

        if (this.ball.x - this.ball.radius < this.paddle1.x + this.paddle1.width &&
            this.ball.y > this.paddle1.y && this.ball.y < this.paddle1.y + this.paddle1.height) {
            this.ball.vx = Math.abs(this.ball.vx) * 1.05;
            const hitPos = (this.ball.y - this.paddle1.y) / this.paddle1.height;
            this.ball.vy = (hitPos - 0.5) * 8;
        }

        if (this.ball.x + this.ball.radius > this.paddle2.x &&
            this.ball.y > this.paddle2.y && this.ball.y < this.paddle2.y + this.paddle2.height) {
            this.ball.vx = -Math.abs(this.ball.vx) * 1.05;
            const hitPos = (this.ball.y - this.paddle2.y) / this.paddle2.height;
            this.ball.vy = (hitPos - 0.5) * 8;
        }

        const aiSpeed = 4;
        const paddleCenter = this.paddle2.y + this.paddle2.height / 2;
        if (paddleCenter < this.ball.y - 20) {
            this.paddle2.y += aiSpeed;
        } else if (paddleCenter > this.ball.y + 20) {
            this.paddle2.y -= aiSpeed;
        }
        this.paddle2.y = Math.max(0, Math.min(this.canvas.height - this.paddle2.height, this.paddle2.y));

        if (this.ball.x < 0) {
            this.paddle2.score++;
            this.resetBall();
        } else if (this.ball.x > this.canvas.width) {
            this.paddle1.score++;
            this.resetBall();
        }

        this.hub.updateScore(this.paddle1.score);
        this.render();
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.vx = (Math.random() > 0.5 ? 1 : -1) * 4;
        this.ball.vy = (Math.random() - 0.5) * 4;
    }

    render() {
        this.ctx.fillStyle = this.colors.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = this.colors.net;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.fillStyle = this.colors.paddle1;
        this.ctx.fillRect(this.paddle1.x, this.paddle1.y, this.paddle1.width, this.paddle1.height);

        this.ctx.fillStyle = this.colors.paddle2;
        this.ctx.fillRect(this.paddle2.x, this.paddle2.y, this.paddle2.width, this.paddle2.height);

        this.ctx.fillStyle = this.colors.ball;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 48px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.paddle1.score, this.canvas.width / 4, 60);
        this.ctx.fillText(this.paddle2.score, this.canvas.width * 3 / 4, 60);
    }

    handleKeyDown(e) {
        const speed = 25;
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                this.paddle1.y = Math.max(0, this.paddle1.y - speed);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                this.paddle1.y = Math.min(this.canvas.height - this.paddle1.height, this.paddle1.y + speed);
                break;
        }
    }

    handleTouchStart(x, y) {
        this.touchY = y;
    }

    handleTouchMove(x, y) {
        const paddleY = (1 - y) * this.canvas.height - this.paddle1.height / 2;
        this.paddle1.y = Math.max(0, Math.min(this.canvas.height - this.paddle1.height, paddleY));
    }

    handleTouchEnd() {}
}
