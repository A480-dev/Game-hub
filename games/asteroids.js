export default class Asteroids {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.ship = { x: 180, y: 320, angle: -Math.PI / 2, vx: 0, vy: 0, radius: 15 };
        this.asteroids = [];
        this.bullets = [];
        this.score = 0;
        this.lives = 3;
        this.isRunning = false;
        this.gameLoop = null;
        this.keys = {};
        this.friction = 0.98;
        this.thrust = 0.15;
        this.asteroidTimer = 0;
    }

    start() {
        this.ship = { x: 180, y: 320, angle: -Math.PI / 2, vx: 0, vy: 0, radius: 15 };
        this.asteroids = [];
        this.bullets = [];
        this.score = 0;
        this.lives = 3;
        this.keys = {};
        
        for (let i = 0; i < 4; i++) {
            this.spawnAsteroid();
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

    spawnAsteroid() {
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch (side) {
            case 0: x = Math.random() * this.canvas.width; y = -30; break;
            case 1: x = this.canvas.width + 30; y = Math.random() * this.canvas.height; break;
            case 2: x = Math.random() * this.canvas.width; y = this.canvas.height + 30; break;
            case 3: x = -30; y = Math.random() * this.canvas.height; break;
        }
        
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 2;
        
        this.asteroids.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 20 + Math.random() * 20,
            vertices: Math.floor(5 + Math.random() * 5)
        });
    }

    update() {
        if (!this.isRunning) return;

        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.ship.angle -= 0.08;
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.ship.angle += 0.08;
        }
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            this.ship.vx += Math.cos(this.ship.angle) * this.thrust;
            this.ship.vy += Math.sin(this.ship.angle) * this.thrust;
        }

        this.ship.vx *= this.friction;
        this.ship.vy *= this.friction;
        this.ship.x += this.ship.vx;
        this.ship.y += this.ship.vy;

        if (this.ship.x < 0) this.ship.x = this.canvas.width;
        if (this.ship.x > this.canvas.width) this.ship.x = 0;
        if (this.ship.y < 0) this.ship.y = this.canvas.height;
        if (this.ship.y > this.canvas.height) this.ship.y = 0;

        this.bullets.forEach(b => {
            b.x += b.vx;
            b.y += b.vy;
        });
        this.bullets = this.bullets.filter(b => 
            b.x > 0 && b.x < this.canvas.width && b.y > 0 && b.y < this.canvas.height
        );

        this.asteroids.forEach(a => {
            a.x += a.vx;
            a.y += a.vy;
            
            if (a.x < -50) a.x = this.canvas.width + 50;
            if (a.x > this.canvas.width + 50) a.x = -50;
            if (a.y < -50) a.y = this.canvas.height + 50;
            if (a.y > this.canvas.height + 50) a.y = -50;
        });

        this.bullets.forEach((bullet, bi) => {
            this.asteroids.forEach((asteroid, ai) => {
                const dx = bullet.x - asteroid.x;
                const dy = bullet.y - asteroid.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < asteroid.radius) {
                    this.asteroids.splice(ai, 1);
                    this.bullets.splice(bi, 1);
                    this.score += 100;
                    this.hub.updateScore(this.score);
                    
                    if (asteroid.radius > 30) {
                        for (let i = 0; i < 2; i++) {
                            const angle = Math.random() * Math.PI * 2;
                            this.asteroids.push({
                                x: asteroid.x,
                                y: asteroid.y,
                                vx: Math.cos(angle) * 2,
                                vy: Math.sin(angle) * 2,
                                radius: asteroid.radius / 2,
                                vertices: asteroid.vertices
                            });
                        }
                    }
                }
            });
        });

        this.asteroids.forEach(asteroid => {
            const dx = this.ship.x - asteroid.x;
            const dy = this.ship.y - asteroid.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < asteroid.radius + this.ship.radius) {
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                } else {
                    this.ship.x = this.canvas.width / 2;
                    this.ship.y = this.canvas.height / 2;
                    this.ship.vx = 0;
                    this.ship.vy = 0;
                }
            }
        });

        this.asteroidTimer++;
        if (this.asteroidTimer > 180 && this.asteroids.length < 8) {
            this.spawnAsteroid();
            this.asteroidTimer = 0;
        }

        this.render();
    }

    render() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 50; i++) {
            const x = (i * 73) % this.canvas.width;
            const y = (i * 137) % this.canvas.height;
            this.ctx.fillRect(x, y, 1, 1);
        }

        this.asteroids.forEach(a => {
            this.ctx.strokeStyle = '#ffbe0b';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            for (let i = 0; i <= a.vertices; i++) {
                const angle = (i / a.vertices) * Math.PI * 2;
                const r = a.radius * (0.8 + Math.sin(i * 3) * 0.2);
                const x = a.x + Math.cos(angle) * r;
                const y = a.y + Math.sin(angle) * r;
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.closePath();
            this.ctx.stroke();
        });

        this.ctx.fillStyle = '#ff006e';
        this.bullets.forEach(b => {
            this.ctx.beginPath();
            this.ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.save();
        this.ctx.translate(this.ship.x, this.ship.y);
        this.ctx.rotate(this.ship.angle);
        
        this.ctx.fillStyle = '#00f5d4';
        this.ctx.beginPath();
        this.ctx.moveTo(15, 0);
        this.ctx.lineTo(-10, -10);
        this.ctx.lineTo(-5, 0);
        this.ctx.lineTo(-10, 10);
        this.ctx.closePath();
        this.ctx.fill();
        
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
            this.ctx.fillStyle = '#ff006e';
            this.ctx.beginPath();
            this.ctx.moveTo(-8, 0);
            this.ctx.lineTo(-18, -5);
            this.ctx.lineTo(-18, 5);
            this.ctx.fill();
        }
        
        this.ctx.restore();

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
        this.keys[e.key] = true;
        
        if (!this.isRunning) return;
        
        if (e.key === ' ' && this.bullets.length < 5) {
            this.bullets.push({
                x: this.ship.x + Math.cos(this.ship.angle) * 15,
                y: this.ship.y + Math.sin(this.ship.angle) * 15,
                vx: Math.cos(this.ship.angle) * 8,
                vy: Math.sin(this.ship.angle) * 8
            });
        }
    }

    handleKeyUp(e) {
        this.keys[e.key] = false;
    }

    handleTouchStart(x, y) {
        this.touchX = x;
        this.touchY = y;
    }

    handleTouchMove(x, y) {
        if (!this.isRunning) return;
        
        const dx = x - this.touchX;
        if (Math.abs(dx) > 0.03) {
            if (dx > 0) this.ship.angle += 0.1;
            else this.ship.angle -= 0.1;
            this.touchX = x;
        }
        
        const dy = y - this.touchY;
        if (dy < -0.05) {
            this.ship.vx += Math.cos(this.ship.angle) * this.thrust;
            this.ship.vy += Math.sin(this.ship.angle) * this.thrust;
            this.touchY = y;
        }
    }

    handleTouchEnd() {}
}
