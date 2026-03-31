export default class Pool {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.balls = [];
        this.cueBall = null;
        this.pockets = [];
        this.score = 0;
        this.isRunning = false;
        this.gameLoop = null;
        this.dragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.power = 0;
        this.angle = 0;
        this.pocketRadius = 20;
    }

    start() {
        this.pockets = [
            { x: 0, y: 0 },
            { x: 180, y: 0 },
            { x: 360, y: 0 },
            { x: 0, y: 640 },
            { x: 180, y: 640 },
            { x: 360, y: 640 }
        ];
        
        this.cueBall = { x: 100, y: 320, vx: 0, vy: 0, radius: 12, color: '#ffffff' };
        
        this.balls = [];
        const colors = ['#ffd700', '#1e90ff', '#ff4500', '#9400d3', '#ff6347', '#00ff7f', '#8b0000', '#00008b'];
        
        let idx = 0;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col <= row; col++) {
                const x = 240 + row * 24;
                const y = 320 - row * 12 + col * 24;
                this.balls.push({
                    x, y, vx: 0, vy: 0,
                    radius: 12,
                    color: colors[idx % colors.length],
                    number: idx + 1
                });
                idx++;
            }
        }
        
        this.score = 0;
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

        const friction = 0.985;
        
        [this.cueBall, ...this.balls].forEach(ball => {
            ball.vx *= friction;
            ball.vy *= friction;
            
            if (Math.abs(ball.vx) < 0.1) ball.vx = 0;
            if (Math.abs(ball.vy) < 0.1) ball.vy = 0;
            
            ball.x += ball.vx;
            ball.y += ball.vy;
            
            if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx *= -0.8; }
            if (ball.x + ball.radius > this.canvas.width) { ball.x = this.canvas.width - ball.radius; ball.vx *= -0.8; }
            if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.vy *= -0.8; }
            if (ball.y + ball.radius > this.canvas.height) { ball.y = this.canvas.height - ball.radius; ball.vy *= -0.8; }
        });

        for (let i = 0; i < this.balls.length; i++) {
            for (let j = i + 1; j < this.balls.length; j++) {
                this.checkCollision(this.balls[i], this.balls[j]);
            }
        }
        this.checkCollision(this.cueBall, this.balls[0]);

        this.balls = this.balls.filter(ball => {
            for (let pocket of this.pockets) {
                const dx = ball.x - pocket.x;
                const dy = ball.y - pocket.y;
                if (Math.sqrt(dx * dx + dy * dy) < this.pocketRadius) {
                    this.score -= 10;
                    this.hub.updateScore(this.score);
                    return false;
                }
            }
            return true;
        });

        const dx = this.cueBall.x - this.pockets[4].x;
        const dy = this.cueBall.y - this.pockets[4].y;
        if (Math.sqrt(dx * dx + dy * dy) < this.pocketRadius) {
            this.cueBall.x = 100;
            this.cueBall.y = 320;
            this.cueBall.vx = 0;
            this.cueBall.vy = 0;
            this.score -= 5;
            this.hub.updateScore(this.score);
        }

        if (this.balls.length === 0) {
            this.score += 100;
            this.hub.updateScore(this.score);
            this.gameOver();
        }

        this.render();
    }

    checkCollision(b1, b2) {
        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < b1.radius + b2.radius) {
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);
            
            const vx1 = b1.vx * cos + b1.vy * sin;
            const vy1 = b1.vy * cos - b1.vx * sin;
            const vx2 = b2.vx * cos + b2.vy * sin;
            const vy2 = b2.vy * cos - b2.vx * sin;
            
            const vx1Final = vx2;
            const vx2Final = vx1;
            
            b1.vx = vx1Final * cos - vy1 * sin;
            b1.vy = vy1 * cos + vx1Final * sin;
            b2.vx = vx2Final * cos - vy2 * sin;
            b2.vy = vy2 * cos + vx2Final * sin;
            
            const overlap = (b1.radius + b2.radius - dist) / 2;
            b1.x -= overlap * Math.cos(angle);
            b1.y -= overlap * Math.sin(angle);
            b2.x += overlap * Math.cos(angle);
            b2.y += overlap * Math.sin(angle);
        }
    }

    shoot() {
        const power = this.power * 15;
        this.cueBall.vx = Math.cos(this.angle) * power;
        this.cueBall.vy = Math.sin(this.angle) * power;
        this.dragging = false;
    }

    render() {
        this.ctx.fillStyle = '#1a472a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#2d5a3d';
        this.ctx.fillRect(10, 10, this.canvas.width - 20, this.canvas.height - 20);

        this.ctx.fillStyle = '#8b4513';
        this.pockets.forEach(p => {
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, this.pocketRadius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.balls.forEach(ball => {
            this.ctx.fillStyle = ball.color;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '10px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(ball.number, ball.x, ball.y);
        });

        this.ctx.fillStyle = this.cueBall.color;
        this.ctx.beginPath();
        this.ctx.arc(this.cueBall.x, this.cueBall.y, this.cueBall.radius, 0, Math.PI * 2);
        this.ctx.fill();

        if (this.dragging) {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.cueBall.x, this.cueBall.y);
            this.ctx.lineTo(
                this.cueBall.x - Math.cos(this.angle) * this.power * 100,
                this.cueBall.y - Math.sin(this.angle) * this.power * 100
            );
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Orbitron';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Bolas: ${this.balls.length}`, 10, 25);
        this.ctx.fillText(`Puntos: ${this.score}`, 250, 25);
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¡GANASTE!', this.canvas.width / 2, this.canvas.height / 2);
        setTimeout(() => this.hub.gameOver(this.score), 1000);
    }

    handleKeyDown(e) {}

    handleTouchStart(x, y) {
        const dx = x - this.cueBall.x;
        const dy = y - this.cueBall.y;
        
        this.dragging = true;
        this.dragStart = { x, y };
        this.angle = Math.atan2(dy, dx);
    }

    handleTouchMove(x, y) {
        if (!this.isRunning || !this.dragging) return;
        
        const dx = x - this.cueBall.x;
        const dy = y - this.cueBall.y;
        this.angle = Math.atan2(dy, dx);
        
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.power = Math.min(dist / 100, 1);
    }

    handleTouchEnd() {
        if (this.dragging && this.power > 0.1) {
            this.shoot();
        }
        this.power = 0;
    }
}
