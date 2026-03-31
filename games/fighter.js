export default class Fighter {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.player = { x: 80, y: 480, width: 40, height: 60, hp: 100, attacking: false };
        this.enemy = { x: 240, y: 480, width: 40, height: 60, hp: 100, attacking: false, dir: -1 };
        this.score = 0;
        this.isRunning = false;
        this.gameLoop = null;
        this.keys = {};
    }

    start() {
        this.player = { x: 80, y: 480, width: 40, height: 60, hp: 100, attacking: false };
        this.enemy = { x: 240, y: 480, width: 40, height: 60, hp: 100, attacking: false, dir: -1 };
        this.score = 0;
        this.isRunning = true;
        this.hub.updateScore(0);
        this.gameLoop = setInterval(() => this.update(), 1000 / 60);
    }

    stop() {
        this.isRunning = false;
        if (this.gameLoop) { clearInterval(this.gameLoop); this.gameLoop = null; }
    }

    update() {
        if (!this.isRunning) return;

        if (this.keys['ArrowLeft'] || this.keys['a']) this.player.x = Math.max(0, this.player.x - 5);
        if (this.keys['ArrowRight'] || this.keys['d']) this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + 5);

        if (Math.random() < 0.02) {
            this.enemy.x += this.enemy.dir * 3;
            if (this.enemy.x <= 0 || this.enemy.x >= this.canvas.width - this.enemy.width) this.enemy.dir *= -1;
        }

        if (Math.random() < 0.015 && Math.abs(this.player.x - this.enemy.x) < 80) {
            this.enemy.attacking = true;
            this.player.hp -= 5;
            setTimeout(() => this.enemy.attacking = false, 200);
        }

        if (this.player.attacking && Math.abs(this.player.x - this.enemy.x) < 80) {
            this.enemy.hp -= 2;
            this.score += 5;
            this.hub.updateScore(this.score);
        }

        if (this.player.hp <= 0 || this.enemy.hp <= 0) this.gameOver();
        this.render();
    }

    render() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(0, 540, this.canvas.width, 100);

        this.ctx.fillStyle = '#00f5d4';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        if (this.player.attacking) {
            this.ctx.fillStyle = '#ff006e';
            this.ctx.fillRect(this.player.x + this.player.width, this.player.y + 20, 20, 20);
        }

        this.ctx.fillStyle = '#ff006e';
        this.ctx.fillRect(this.enemy.x, this.enemy.y, this.enemy.width, this.enemy.height);
        if (this.enemy.attacking) {
            this.ctx.fillStyle = '#ffbe0b';
            this.ctx.fillRect(this.enemy.x - 20, this.enemy.y + 20, 20, 20);
        }

        this.ctx.fillStyle = '#0f0';
        this.ctx.fillRect(20, 20, 150 * (this.player.hp / 100), 15);
        this.ctx.strokeStyle = '#fff';
        this.ctx.strokeRect(20, 20, 150, 15);
        this.ctx.fillStyle = '#f00';
        this.ctx.fillRect(190, 20, 150 * (this.enemy.hp / 100), 15);
        this.ctx.strokeRect(190, 20, 150, 15);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Orbitron';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('JUGADOR', 20, 55);
        this.ctx.textAlign = 'right';
        this.ctx.fillText('ENEMIGO', 340, 55);
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.player.hp > 0 ? '#00f5d4' : '#ff006e';
        this.ctx.font = 'bold 28px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.player.hp > 0 ? '¡GANASTE!' : 'PERDISTE', this.canvas.width / 2, this.canvas.height / 2);
        setTimeout(() => this.hub.gameOver(this.score), 1000);
    }

    handleKeyDown(e) {
        this.keys[e.key] = true;
        if (e.key === ' ' || e.key === 'ArrowUp') {
            if (!this.player.attacking) {
                this.player.attacking = true;
                setTimeout(() => this.player.attacking = false, 300);
            }
        }
    }

    handleKeyUp(e) { this.keys[e.key] = false; }

    handleTouchStart(x, y) {
        if (x < 0.5) this.player.x = Math.max(0, this.player.x - 30);
        else this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + 30);
        
        if (!this.player.attacking) {
            this.player.attacking = true;
            setTimeout(() => this.player.attacking = false, 300);
        }
    }
    handleTouchMove(x, y) {}
    handleTouchEnd() {}
}
