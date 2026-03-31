export default class Flappy {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.bird = { x: 80, y: 320, vy: 0, radius: 14 };
        this.gravity = 0.4;
        this.jump = -7;
        this.pipes = [];
        this.score = 0;
        this.isRunning = false;
        this.gameLoop = null;
        this.pipeGap = 140;
        this.pipeSpeed = 2.5;
        this.pipeSpawn = 100;
        this.frameCount = 0;
        this.colors = {
            bg: '#1a1a2e',
            bird: '#ffbe0b',
            birdWing: '#fb5607',
            pipe: '#06d6a0',
            pipeDark: '#118ab2',
            text: '#ffffff'
        };
    }

    start() {
        this.bird = { x: 80, y: 320, vy: 0, radius: 14 };
        this.pipes = [];
        this.score = 0;
        this.frameCount = 0;
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

        this.frameCount++;
        this.bird.vy += this.gravity;
        this.bird.y += this.bird.vy;

        if (this.bird.y - this.bird.radius < 0 || this.bird.y + this.bird.radius > this.canvas.height) {
            this.gameOver();
            return;
        }

        if (this.frameCount % this.pipeSpawn === 0) {
            const minHeight = 60;
            const maxHeight = this.canvas.height - this.pipeGap - minHeight;
            const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
            
            this.pipes.push({
                x: this.canvas.width,
                topHeight: topHeight,
                passed: false
            });
        }

        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;

            if (!pipe.passed && pipe.x + 50 < this.bird.x) {
                pipe.passed = true;
                this.score++;
                this.hub.updateScore(this.score);
            }

            if (pipe.x + 50 < 0) {
                this.pipes.splice(i, 1);
                continue;
            }

            const birdLeft = this.bird.x - this.bird.radius;
            const birdRight = this.bird.x + this.bird.radius;
            const birdTop = this.bird.y - this.bird.radius;
            const birdBottom = this.bird.y + this.bird.radius;

            if (birdRight > pipe.x && birdLeft < pipe.x + 50) {
                if (birdTop < pipe.topHeight || birdBottom > pipe.topHeight + this.pipeGap) {
                    this.gameOver();
                    return;
                }
            }
        }

        this.render();
    }

    render() {
        this.ctx.fillStyle = this.colors.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = 'rgba(255,255,255,0.05)';
        for (let i = 0; i < 20; i++) {
            this.ctx.beginPath();
            this.ctx.arc(50 + i * 40, 100 + (i % 3) * 30, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }

        for (let pipe of this.pipes) {
            this.ctx.fillStyle = this.colors.pipe;
            this.ctx.fillRect(pipe.x, 0, 50, pipe.topHeight);
            this.ctx.fillStyle = this.colors.pipeDark;
            this.ctx.fillRect(pipe.x + 5, 0, 40, pipe.topHeight - 10);

            const bottomY = pipe.topHeight + this.pipeGap;
            this.ctx.fillStyle = this.colors.pipe;
            this.ctx.fillRect(pipe.x, bottomY, 50, this.canvas.height - bottomY);
            this.ctx.fillStyle = this.colors.pipeDark;
            this.ctx.fillRect(pipe.x + 5, bottomY + 10, 40, this.canvas.height - bottomY - 10);
        }

        this.ctx.fillStyle = this.colors.birdWing;
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x - 4, this.bird.y + 4, this.bird.radius * 0.6, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = this.colors.bird;
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x + 6, this.bird.y - 4, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(this.bird.x + 7, this.bird.y - 4, 2, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#ffbe0b';
        this.ctx.beginPath();
        this.ctx.moveTo(this.bird.x + 10, this.bird.y + 2);
        this.ctx.lineTo(this.bird.x + 20, this.bird.y + 6);
        this.ctx.lineTo(this.bird.x + 10, this.bird.y + 10);
        this.ctx.fill();

        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 36px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.score, this.canvas.width / 2, 50);
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 32px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = '20px Rajdhani, sans-serif';
        this.ctx.fillText(`Puntuación: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        setTimeout(() => this.hub.gameOver(this.score), 1000);
    }

    handleKeyDown(e) {
        if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
            this.bird.vy = this.jump;
        }
    }

    handleTouchStart(x, y, startY) {
        this.bird.vy = this.jump;
    }

    handleTouchMove(x, y) {}

    handleTouchEnd() {}
}
