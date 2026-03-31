export default class Memory {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.cards = [];
        this.flipped = [];
        this.matched = 0;
        this.score = 0;
        this.moves = 0;
        this.isRunning = false;
        this.canFlip = true;
        this.gameLoop = null;
        this.symbols = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍒', '🥝', '🍑'];
        this.gridSize = 4;
        this.cardSize = 70;
        this.cardGap = 10;
        this.offsetX = 0;
        this.offsetY = 0;
        this.colors = {
            bg: '#0a0a0f',
            cardBack: '#1a1a25',
            cardFront: '#222230',
            cardBorder: '#00f5d4',
            matched: '#06d6a0',
            text: '#ffffff'
        };
    }

    start() {
        this.cards = [];
        this.flipped = [];
        this.matched = 0;
        this.score = 0;
        this.moves = 0;
        this.canFlip = true;
        this.isRunning = true;
        this.hub.updateScore(0);
        
        const pairs = [...this.symbols, ...this.symbols];
        for (let i = pairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
        }

        const totalWidth = this.gridSize * this.cardSize + (this.gridSize - 1) * this.cardGap;
        this.offsetX = (this.canvas.width - totalWidth) / 2;
        this.offsetY = 120;

        let idx = 0;
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                this.cards.push({
                    x: this.offsetX + col * (this.cardSize + this.cardGap),
                    y: this.offsetY + row * (this.cardSize + this.cardGap),
                    symbol: pairs[idx],
                    flipped: false,
                    matched: false,
                    scale: 1
                });
                idx++;
            }
        }

        this.render();
    }

    stop() {
        this.isRunning = false;
    }

    flipCard(x, y) {
        if (!this.canFlip || !this.isRunning) return;

        for (let card of this.cards) {
            if (x >= card.x && x <= card.x + this.cardSize &&
                y >= card.y && y <= card.y + this.cardSize) {
                
                if (card.flipped || card.matched) return;

                card.flipped = true;
                this.flipped.push(card);

                if (this.flipped.length === 2) {
                    this.moves++;
                    this.canFlip = false;
                    
                    if (this.flipped[0].symbol === this.flipped[1].symbol) {
                        this.flipped[0].matched = true;
                        this.flipped[1].matched = true;
                        this.matched++;
                        this.score += 20;
                        this.hub.updateScore(this.score);
                        this.flipped = [];
                        this.canFlip = true;

                        if (this.matched === this.gridSize * 2) {
                            this.score += 50 - this.moves;
                            this.hub.updateScore(this.score);
                            setTimeout(() => this.gameOver(), 500);
                        }
                    } else {
                        setTimeout(() => {
                            this.flipped[0].flipped = false;
                            this.flipped[1].flipped = false;
                            this.flipped = [];
                            this.canFlip = true;
                            this.render();
                        }, 1000);
                    }
                }
                break;
            }
        }
        this.render();
    }

    render() {
        this.ctx.fillStyle = this.colors.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 24px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('MEMORY', this.canvas.width / 2, 40);

        this.ctx.font = '16px Rajdhani, sans-serif';
        this.ctx.fillText(`Movimientos: ${this.moves}`, this.canvas.width / 2, 70);

        for (let card of this.cards) {
            if (card.flipped || card.matched) {
                this.ctx.fillStyle = card.matched ? this.colors.matched : this.colors.cardFront;
            } else {
                this.ctx.fillStyle = this.colors.cardBack;
            }

            const padding = 4;
            this.ctx.fillRect(
                card.x + padding,
                card.y + padding,
                this.cardSize - padding * 2,
                this.cardSize - padding * 2
            );

            if (card.flipped || card.matched) {
                this.ctx.font = '32px sans-serif';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(
                    card.symbol,
                    card.x + this.cardSize / 2,
                    card.y + this.cardSize / 2
                );
                this.ctx.textBaseline = 'alphabetic';
            } else {
                this.ctx.strokeStyle = 'rgba(0, 245, 212, 0.3)';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(
                    card.x + padding,
                    card.y + padding,
                    this.cardSize - padding * 2,
                    this.cardSize - padding * 2
                );
            }
        }
    }

    gameOver() {
        this.isRunning = false;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#00f5d4';
        this.ctx.font = 'bold 32px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¡COMPLETO!', this.canvas.width / 2, this.canvas.height / 2 - 30);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Rajdhani, sans-serif';
        this.ctx.fillText(`Puntuación: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.fillText(`Movimientos: ${this.moves}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        
        setTimeout(() => this.hub.gameOver(this.score), 1500);
    }

    handleKeyDown(e) {}

    handleTouchStart(x, y) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const canvasX = (x - rect.left) * scaleX;
        const canvasY = (y - rect.top) * scaleY;
        this.flipCard(canvasX, canvasY);
    }

    handleTouchMove(x, y) {}

    handleTouchEnd() {}
}
