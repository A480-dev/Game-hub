export default class SpaceInvaders {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.player = { x: 160, y: 580, width: 40, height: 20, speed: 5 };
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.score = 0;
        this.lives = 3;
        this.isRunning = false;
        this.gameLoop = null;
        this.lastShot = 0;
        this.enemyDirection = 1;
        this.enemySpeed = 1;
    }

    start() {
        this.player = { x: 160, y: 580, width: 40, height: 20, speed: 5 };
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.score = 0;
        this.lives = 3;
        this.enemyDirection = 1;
        this.enemySpeed = 1;
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 8; col++) {
                this.enemies.push({
                    x: 30 + col * 40,
                    y: 60 + row * 35,
                    width: 30,
                    height: 25,
                    alive: true
                });
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
        
        this.bullets.forEach(b => b.y -= 7);
        this.bullets = this.bullets.filter(b => b.y > 0);
        
        this.enemyBullets.forEach(b => b.y += 4);
        this.enemyBullets = this.enemyBullets.filter(b => b.y < this.canvas.height);
        
        let hitEdge = false;
        this.enemies.forEach(e => {
            if (!e.alive) return;
            e.x += this.enemySpeed * this.enemyDirection;
            if (e.x <= 10 || e.x + e.width >= this.canvas.width - 10) hitEdge = true;
        });
        
        if (hitEdge) {
            this.enemyDirection *= -1;
            this.enemies.forEach(e => {
                if (e.alive) e.y += 15;
            });
            this.enemySpeed = Math.min(this.enemySpeed + 0.1, 3);
        }
        
        if (Math.random() < 0.015 && this.enemies.some(e => e.alive)) {
            const aliveEnemies = this.enemies.filter(e => e.alive);
            const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
            this.enemyBullets.push({ x: shooter.x + shooter.width / 2, y: shooter.y + shooter.height });
        }
        
        this.bullets.forEach(bullet => {
            this.enemies.forEach(enemy => {
                if (!enemy.alive) return;
                if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width &&
                    bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
                    enemy.alive = false;
                    bullet.y = -10;
                    this.score += 10;
                    this.hub.updateScore(this.score);
                }
            });
        });
        
        this.enemyBullets.forEach(bullet => {
            if (bullet.x > this.player.x && bullet.x < this.player.x + this.player.width &&
                bullet.y > this.player.y && bullet.y < this.player.y + this.player.height) {
                this.lives--;
                bullet.y = this.canvas.height + 10;
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });
        
        if (this.enemies.every(e => !e.alive)) {
            this.enemySpeed += 0.5;
            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 8; col++) {
                    this.enemies.push({
                        x: 30 + col * 40,
                        y: 60 + row * 35,
                        width: 30,
                        height: 25,
                        alive: true
                    });
                }
            }
        }
        
        this.render();
    }

    render() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00f5d4';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ff006e';
        this.bullets.forEach(b => {
            this.ctx.fillRect(b.x - 2, b.y, 4, 10);
        });
        
        this.enemies.forEach(e => {
            if (!e.alive) return;
            this.ctx.fillStyle = '#ffbe0b';
            this.ctx.fillRect(e.x, e.y, e.width, e.height);
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(e.x + 5, e.y + 8, 5, 5);
            this.ctx.fillRect(e.x + e.width - 10, e.y + 8, 5, 5);
        });
        
        this.ctx.fillStyle = '#8338ec';
        this.enemyBullets.forEach(b => {
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
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
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
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
                this.player.x = Math.max(0, this.player.x - this.player.speed);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
                break;
            case ' ':
            case 'ArrowUp':
                if (Date.now() - this.lastShot > 300) {
                    this.bullets.push({ x: this.player.x + this.player.width / 2, y: this.player.y });
                    this.lastShot = Date.now();
                }
                break;
        }
    }

    handleTouchStart(x, y) {
        this.touchX = x;
    }

    handleTouchMove(x, y) {
        if (!this.isRunning) return;
        const playerX = x * this.canvas.width - this.player.width / 2;
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, playerX));
    }

    handleTouchEnd() {
        if (Date.now() - this.lastShot > 300) {
            this.bullets.push({ x: this.player.x + this.player.width / 2, y: this.player.y });
            this.lastShot = Date.now();
        }
    }
}
