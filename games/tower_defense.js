export default class TowerDefense {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.path = [{x:0,y:100},{x:80,y:100},{x:80,y:300},{x:280,y:300},{x:280,y:100},{x:360,y:100}];
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.money = 100;
        this.lives = 20;
        this.wave = 1;
        this.score = 0;
        this.isRunning = false;
        this.gameLoop = null;
        this.spawnTimer = 0;
        this.enemiesToSpawn = 0;
    }

    start() {
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];
        this.money = 150;
        this.lives = 20;
        this.wave = 1;
        this.score = 0;
        this.enemiesToSpawn = 5;
        this.spawnTimer = 0;
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

        if (this.enemiesToSpawn > 0) {
            this.spawnTimer++;
            if (this.spawnTimer >= 60) {
                this.spawnTimer = 0;
                this.enemies.push({
                    x: this.path[0].x,
                    y: this.path[0].y,
                    hp: 20 + this.wave * 10,
                    maxHp: 20 + this.wave * 10,
                    pathIndex: 0,
                    speed: 1.5
                });
                this.enemiesToSpawn--;
            }
        } else if (this.enemies.length === 0) {
            this.wave++;
            this.enemiesToSpawn = 5 + this.wave * 2;
        }

        this.enemies.forEach(e => {
            const target = this.path[e.pathIndex + 1];
            if (target) {
                const dx = target.x - e.x;
                const dy = target.y - e.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < e.speed) {
                    e.pathIndex++;
                } else {
                    e.x += (dx / dist) * e.speed;
                    e.y += (dy / dist) * e.speed;
                }
            } else {
                this.lives--;
                e.hp = 0;
            }
        });

        this.enemies = this.enemies.filter(e => e.hp > 0);

        this.towers.forEach(t => {
            t.cooldown--;
            if (t.cooldown <= 0) {
                let target = null;
                let minDist = 150;
                this.enemies.forEach(e => {
                    const dx = e.x - t.x;
                    const dy = e.y - t.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < minDist) {
                        minDist = dist;
                        target = e;
                    }
                });
                if (target) {
                    this.projectiles.push({
                        x: t.x, y: t.y,
                        target: target,
                        speed: 8,
                        damage: t.damage
                    });
                    t.cooldown = t.fireRate;
                }
            }
        });

        this.projectiles.forEach(p => {
            const dx = p.target.x - p.x;
            const dy = p.target.y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < p.speed) {
                p.target.hp -= p.damage;
                if (p.target.hp <= 0) {
                    this.money += 15;
                    this.score += 10;
                    this.hub.updateScore(this.score);
                }
                p.target = null;
            } else {
                p.x += (dx / dist) * p.speed;
                p.y += (dy / dist) * p.speed;
            }
        });
        this.projectiles = this.projectiles.filter(p => p.target && p.target.hp > 0);

        if (this.lives <= 0) this.gameOver();
        this.render();
    }

    render() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 30;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(this.path[0].x, this.path[0].y);
        this.path.forEach(p => this.ctx.lineTo(p.x, p.y));
        this.ctx.stroke();

        this.towers.forEach(t => {
            this.ctx.fillStyle = '#00f5d4';
            this.ctx.fillRect(t.x - 15, t.y - 15, 30, 30);
            this.ctx.fillStyle = '#ff006e';
            this.ctx.beginPath();
            this.ctx.arc(t.x, t.y, 8, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.enemies.forEach(e => {
            this.ctx.fillStyle = '#ff006e';
            this.ctx.beginPath();
            this.ctx.arc(e.x, e.y, 12, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.fillStyle = '#0f0';
            this.ctx.fillRect(e.x - 10, e.y - 20, 20 * (e.hp / e.maxHp), 4);
        });

        this.projectiles.forEach(p => {
            this.ctx.fillStyle = '#ffbe0b';
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Orbitron';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Ola: ${this.wave}`, 10, 25);
        this.ctx.fillText(`$: ${this.money}`, 80, 25);
        this.ctx.fillText(`Vidas: ${this.lives}`, 180, 25);
    }

    placeTower(x, y) {
        if (this.money >= 50) {
            this.towers.push({ x, y, damage: 10, fireRate: 30, cooldown: 0 });
            this.money -= 50;
        }
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 28px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
        setTimeout(() => this.hub.gameOver(this.score), 1000);
    }

    handleKeyDown(e) {
        if (e.key === '1' && this.money >= 50) this.placeTower(100, 200);
        if (e.key === '2' && this.money >= 50) this.placeTower(180, 200);
    }

    handleTouchStart(x, y) {
        if (this.money >= 50) this.placeTower(x, y);
    }
    handleTouchMove(x, y) {}
    handleTouchEnd() {}
}
