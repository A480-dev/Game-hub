// ============================================
// INPUT HANDLER - Universal Controls (PC + Mobile)
// ============================================
class InputHandler {
    constructor() {
        this.keys = {};
        this.touch = { active: false, startX: 0, startY: 0, currentX: 0, currentY: 0 };
        this.swipeThreshold = 30;
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    bindTouch(canvas) {
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            this.touch.active = true;
            this.touch.startX = (touch.clientX - rect.left) * scaleX;
            this.touch.startY = (touch.clientY - rect.top) * scaleY;
            this.touch.currentX = this.touch.startX;
            this.touch.currentY = this.touch.startY;
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            
            this.touch.currentX = (touch.clientX - rect.left) * scaleX;
            this.touch.currentY = (touch.clientY - rect.top) * scaleY;
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.touch.active = false;
        }, { passive: false });
    }

    isKeyPressed(key) {
        return this.keys[key] === true;
    }

    isKeyPressedAny(keys) {
        return keys.some(k => this.keys[k] === true);
    }

    getSwipeDirection() {
        if (!this.touch.active) return null;
        
        const dx = this.touch.currentX - this.touch.startX;
        const dy = this.touch.currentY - this.touch.startY;
        
        if (Math.abs(dx) < this.swipeThreshold && Math.abs(dy) < this.swipeThreshold) {
            return 'tap';
        }
        
        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0 ? 'right' : 'left';
        } else {
            return dy > 0 ? 'down' : 'up';
        }
    }

    resetSwipe() {
        this.touch.startX = this.touch.currentX;
        this.touch.startY = this.touch.currentY;
    }

    getTapPosition() {
        if (!this.touch.active) return null;
        return { x: this.touch.currentX, y: this.touch.currentY };
    }
}

// ============================================
// GAME BASE CLASS
// ============================================
class Game {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.input = new InputHandler();
        this.input.bindTouch(canvas);
        this.isRunning = false;
        this.score = 0;
        this.lastTime = 0;
        this.gameLoop = null;
    }

    init() {}
    update(deltaTime) {}
    draw() {}

    start() {
        this.isRunning = true;
        this.score = 0;
        this.lastTime = performance.now();
        this.init();
        
        const gameLoopFn = (timestamp) => {
            if (!this.isRunning) return;
            
            const deltaTime = timestamp - this.lastTime;
            this.lastTime = timestamp;
            
            this.update(deltaTime);
            this.draw();
            
            this.gameLoop = requestAnimationFrame(gameLoopFn);
        };
        
        this.gameLoop = requestAnimationFrame(gameLoopFn);
    }

    stop() {
        this.isRunning = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
    }

    updateScore(points) {
        this.score = points;
        if (this.hub) {
            this.hub.updateScore(points);
        }
    }

    gameOver() {
        this.stop();
        if (this.hub) {
            this.hub.gameOver(this.score);
        }
    }
}

// ============================================
// INSTRUCTION OVERLAY SYSTEM
// ============================================
class InstructionOverlay {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.visible = false;
    }

    show(gameName, pcControls, mobileControls, onStart) {
        this.visible = true;
        this.pcControls = pcControls;
        this.mobileControls = mobileControls;
        this.onStart = onStart;
        this.gameName = gameName;
        this.draw();
    }

    draw() {
        if (!this.visible) return;

        this.ctx.fillStyle = 'rgba(10, 10, 15, 0.95)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#00f5d4';
        this.ctx.font = 'bold 28px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.gameName.toUpperCase(), this.canvas.width / 2, 80);

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Rajdhani, sans-serif';
        this.ctx.fillText('¿CÓMO JUGAR?', this.canvas.width / 2, 130);

        const boxWidth = 150;
        const boxHeight = 160;
        const startX = (this.canvas.width - boxWidth * 2 - 20) / 2;
        const startY = 160;

        this.drawControlBox(startX, startY, boxWidth, boxHeight, '🖥️', 'PC', this.pcControls);
        this.drawControlBox(startX + boxWidth + 20, startY, boxWidth, boxHeight, '📱', 'MÓVIL', this.mobileControls);

        const btnWidth = 200;
        const btnHeight = 50;
        const btnX = (this.canvas.width - btnWidth) / 2;
        const btnY = 400;

        this.ctx.fillStyle = '#00f5d4';
        this.ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
        
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.font = 'bold 20px Orbitron, sans-serif';
        this.ctx.fillText('COMENZAR', this.canvas.width / 2, btnY + 33);

        this.canvas.style.cursor = 'pointer';
        this.canvas.onclick = () => {
            this.visible = false;
            this.canvas.style.cursor = 'default';
            this.canvas.onclick = null;
            if (this.onStart) this.onStart();
        };
    }

    drawControlBox(x, y, w, h, icon, title, controls) {
        this.ctx.fillStyle = '#1a1a25';
        this.ctx.fillRect(x, y, w, h);
        
        this.ctx.strokeStyle = '#00f5d4';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, w, h);

        this.ctx.font = '32px sans-serif';
        this.ctx.fillText(icon, x + w / 2, y + 40);

        this.ctx.fillStyle = '#00f5d4';
        this.ctx.font = 'bold 14px Orbitron, sans-serif';
        this.ctx.fillText(title, x + w / 2, y + 65);

        this.ctx.fillStyle = '#aaaaaa';
        this.ctx.font = '11px Rajdhani, sans-serif';
        controls.forEach((text, i) => {
            this.ctx.fillText(text, x + w / 2, y + 90 + i * 18);
        });
    }
}
