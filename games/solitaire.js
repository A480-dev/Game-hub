export default class Solitaire {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.cardWidth = 35;
        this.cardHeight = 50;
        this.deck = [];
        this.tableau = [[], [], [], [], [], [], []];
        this.foundations = [[], [], [], []];
        this.waste = [];
        this.score = 0;
        this.isRunning = false;
        this.selected = null;
    }

    start() {
        this.deck = [];
        const suits = ['♥', '♦', '♣', '♠'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        for (let s of suits) {
            for (let r of ranks) {
                const color = (s === '♥' || s === '♦') ? 'red' : 'black';
                this.deck.push({ suit: s, rank: r, color, faceUp: false });
            }
        }
        
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
        
        this.tableau = [[], [], [], [], [], [], []];
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j <= i; j++) {
                const card = this.deck.pop();
                if (j === i) card.faceUp = true;
                this.tableau[i].push(card);
            }
        }
        
        this.foundations = [[], [], [], []];
        this.waste = [];
        this.score = 0;
        this.isRunning = true;
        this.hub.updateScore(0);
        this.render();
    }

    stop() { this.isRunning = false; }

    getCardValue(card) {
        const values = { 'A': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13 };
        return values[card.rank];
    }

    canPlaceOnTableau(card, pile) {
        if (pile.length === 0) return card.rank === 'K';
        const top = pile[pile.length - 1];
        return top.faceUp && card.color !== top.color && this.getCardValue(card) === this.getCardValue(top) - 1;
    }

    canPlaceOnFoundation(card, pile) {
        if (pile.length === 0) return card.rank === 'A';
        const top = pile[pile.length - 1];
        return card.suit === top.suit && this.getCardValue(card) === this.getCardValue(top) + 1;
    }

    handleClick(x, y) {
        if (y < 80 && x > 280) {
            if (this.deck.length > 0) {
                const card = this.deck.pop();
                card.faceUp = true;
                this.waste.push(card);
            } else if (this.waste.length > 0) {
                this.deck = this.waste.reverse().map(c => ({ ...c, faceUp: false }));
                this.waste = [];
            }
            this.render();
            return;
        }

        for (let i = 0; i < 4; i++) {
            const fx = 30 + i * 80;
            if (x > fx && x < fx + this.cardWidth && y > 10 && y < 10 + this.cardHeight) {
                if (this.waste.length > 0 && this.canPlaceOnFoundation(this.waste[this.waste.length - 1], this.foundations[i])) {
                    this.foundations[i].push(this.waste.pop());
                    this.score += 10;
                    this.hub.updateScore(this.score);
                }
                this.render();
                return;
            }
        }

        for (let col = 0; col < 7; col++) {
            const tx = 10 + col * 50;
            for (let row = 0; row < this.tableau[col].length; row++) {
                const ty = 80 + row * 25;
                if (x > tx && x < tx + this.cardWidth && y > ty && y < ty + this.cardHeight) {
                    const card = this.tableau[col][row];
                    if (!card.faceUp) continue;
                    
                    if (!this.selected) {
                        this.selected = { col, row, card };
                    } else {
                        const src = this.selected;
                        if (src.col === col && src.row === row) {
                            this.selected = null;
                        } else if (this.canPlaceOnTableau(src.card, this.tableau[col])) {
                            const cards = this.tableau[src.col].slice(src.row);
                            this.tableau[col].push(...cards);
                            this.tableau[src.col].splice(src.row);
                            if (this.tableau[src.col].length > 0) {
                                this.tableau[src.col][this.tableau[src.col].length - 1].faceUp = true;
                            }
                            this.score += 5;
                            this.hub.updateScore(this.score);
                            this.selected = null;
                        } else {
                            this.selected = { col, row, card };
                        }
                    }
                    this.render();
                    return;
                }
            }
        }
        
        if (this.waste.length > 0 && !this.selected) {
            const card = this.waste[this.waste.length - 1];
            for (let col = 0; col < 7; col++) {
                if (this.canPlaceOnTableau(card, this.tableau[col])) {
                    this.tableau[col].push(this.waste.pop());
                    this.score += 5;
                    this.hub.updateScore(this.score);
                    this.render();
                    return;
                }
            }
        }
    }

    render() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 18px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('SOLITAIRE', this.canvas.width / 2, 25);

        for (let i = 0; i < 4; i++) {
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(30 + i * 80, 10, this.cardWidth, this.cardHeight);
            
            if (this.foundations[i].length > 0) {
                const card = this.foundations[i][this.foundations[i].length - 1];
                this.drawCard(card, 30 + i * 80, 10);
            }
        }

        this.ctx.strokeStyle = '#333';
        this.ctx.strokeRect(290, 10, this.cardWidth, this.cardHeight);
        if (this.deck.length > 0) {
            this.ctx.fillStyle = '#1a472a';
            this.ctx.fillRect(290, 10, this.cardWidth, this.cardHeight);
        }
        if (this.waste.length > 0) {
            this.drawCard(this.waste[this.waste.length - 1], 290, 10);
        }

        for (let col = 0; col < 7; col++) {
            for (let row = 0; row < this.tableau[col].length; row++) {
                this.drawCard(this.tableau[col][row], 10 + col * 50, 80 + row * 25);
            }
        }

        this.ctx.fillStyle = '#ff006e';
        this.ctx.font = '14px Orbitron';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Puntos: ${this.score}`, 10, 620);
    }

    drawCard(card, x, y) {
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x, y, this.cardWidth, this.cardHeight);
        this.ctx.fillStyle = card.color === 'red' ? '#d00' : '#000';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(card.rank, x + this.cardWidth / 2, y + 15);
        this.ctx.font = '20px sans-serif';
        this.ctx.fillText(card.suit, x + this.cardWidth / 2, y + 35);
    }

    handleKeyDown(e) {}
    handleTouchStart(x, y) { this.handleClick(x, y); }
    handleTouchMove(x, y) {}
    handleTouchEnd() {}
}
