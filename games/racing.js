export default class Racing {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.player = { x: 180, y: 520, width: 30, height: 50 };
        this.obstacles = [];
        this.score = 0;
        this.speed = 4;
        this.lanes = [60, 140, 220, 300];
        this.lane = 1;
        this.isRunning = false;
        this.gameLoop = null;
        this.roadOffset = 0;
    }

    start() {
        this.player = { x: this.lanes[1] - 15, y: 520, width: 30, height: 50 };
        this.obstacles = [];
        this.score = 0;
        this.speed = 4;
        this.lane = 1;
        this.roadOffset = 0;
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

    spawnObstacle() {
        const lane = Math.floor(Math.random() * 4);
        this.obstacles.push({
            x: this.lanes[lane],
            y: -60,
            width: 30,
            height: 50,
            type: Math.random() > 0.5 ? 'car' : 'rock'
        });
    }

    update() {
        if (!this.isRunning) return;

        this.roadOffset += this.speed;
        if (this.roadOffset > 40) this.roadOffset = 0;

        if (Math.random() < 0.02) this.spawnObstacle();

        this.obstacles.forEach(o => o.y += this.speed);
        this.obstacles = this.obstacles.filter(o => o.y < this.canvas.height + 60);

        const playerCenterX = this.player.x + this.player.width / 2;
        const playerCenterY = this.player.y + this.player.height / 2;

        this.obstacles.forEach(o => {
            const obstacleCenterX = o.x + o.width / 2;
            const obstacleCenterY = o.y + o.height / 2;
            
            const dx = Math.abs(playerCenterX - obstacleCenterX);
            const dy = Math.abs(playerCenterY - obstacleCenterY);
            
            if (dx < (this.player.width / 2 + o.width / 2 - 5) &&
                dy < (this.player.height / 2 + o.height / 2 - 10)) {
                this.gameOver();
            }
        });

        this.score++;
        if (this.score % 500 === 0) this.speed += 0.5;
        this.hub.updateScore(Math.floor(this.score / 10));
        this.render();
    }

    render() {
        this.ctx.fillStyle = '#2d3436';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#636e72';
        this.ctx.fillRect(30, 0, 300, this.canvas.height);

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.setLineDash([20, 20]);
        this.ctx.lineDashOffset = -this.roadOffset;
        
        for (let i = 1; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.lanes[i], 0);
            this.ctx.lineTo(this.lanes[i], this.canvas.height);
            this.ctx.stroke();
        }
        this.ctx.setLineDash([]);

        this.obstacles.forEach(o => {
            if (o.type === 'car') {
                this.ctx.fillStyle = '#e17055';
                this.ctx.fillRect(o.x, o.y, o.width, o.height);
                this.ctx.fillStyle = '#fdcb6e';
                this.ctx.fillRect(o.x + 5, o.y + 5, 20, 10);
            } else {
                this.ctx.fillStyle = '#636e72';
                this.ctx.beginPath();
                this.ctx.arc(o.x + o.width/2, o.y + o.height/2, 20, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });

        this.ctx.fillStyle = '#00f5d4';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        this.ctx.fillStyle = '#74b9ff';
        this.ctx.fillRect(this.player.x + 3, this.player.y + 5, 24, 15);
        this.ctx.fillStyle = '#fdcb6e';
        this.ctx.fillRect(this.player.x + 3, this.player.y + 35, 24, 10);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Orbitron';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Puntos: ${Math.floor(this.score / 10)}`, 10, 25);
        this.ctx.fillText(`Velocidad: ${this.speed}`, 250, 25);
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 28px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        setTimeout(() => this.hub.gameOver(Math.floor(this.score / 10)), 1000);
    }

    handleKeyDown(e) {
        if (!this.isRunning) return;
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.lane > 0) {
                    this.lane--;
                    this.player.x = this.lanes[this.lane];
                }
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.lane < 3) {
                    this.lane++;
                    this.player.x = this.lanes[this.lane];
                }
                break;
        }
    }

    handleTouchStart(x, y) {
        this.touchX = x;
    }

    handleTouchMove(x, y) {
        if (!this.isRunning || !this.touchX) return;
        
        const dx = x - this.touchX;
        if (Math.abs(dx) > 0.08) {
            if (dx > 0 && this.lane < 3) {
                this.lane++;
                this.player.x = this.lanes[this.lane];
            } else if (dx < 0 && this.lane > 0) {
                this.lane--;
                this.player.x = this.lanes[this.lane];
            }
            this.touchX = x;
        }
    }

    handleTouchEnd() {
        this.touchX = null;
    }
}
