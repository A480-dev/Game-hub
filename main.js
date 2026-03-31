const GAMES = [
    { id: 1, name: 'Snake', icon: '🐍', file: 'snake.js', playable: true },
    { id: 2, name: 'Pong', icon: '🏓', file: 'pong.js', playable: true },
    { id: 3, name: 'Breakout', icon: '🧱', file: 'breakout.js', playable: true },
    { id: 4, name: 'Flappy Bird', icon: '🐦', file: 'flappy.js', playable: true },
    { id: 5, name: 'Memory', icon: '🧠', file: 'memory.js', playable: true },
    { id: 6, name: 'Tetris', icon: '📦', file: 'tetris.js', playable: true },
    { id: 7, name: 'Space Invaders', icon: '👾', file: 'space_invaders.js', playable: true },
    { id: 8, name: '2048', icon: '🎲', file: '2048.js', playable: true },
    { id: 9, name: 'Whack-a-Mole', icon: '🐹', file: 'whack_mole.js', playable: true },
    { id: 10, name: 'Asteroids', icon: '☄️', file: 'asteroids.js', playable: true },
    { id: 11, name: 'Racing', icon: '🏎️', file: 'racing.js', playable: true },
    { id: 12, name: 'Pool', icon: '🎱', file: 'pool.js', playable: true },
    { id: 13, name: 'Pac-Man', icon: '👻', file: 'pacman.js', playable: true },
    { id: 14, name: 'Tower Defense', icon: '🏰', file: 'tower_defense.js', playable: true },
    { id: 15, name: 'Sudoku', icon: '🔢', file: 'sudoku.js', playable: true },
    { id: 16, name: 'Candy Crush', icon: '🍬', file: 'candy_crush.js', playable: true },
    { id: 17, name: 'Fighter', icon: '🥊', file: 'fighter.js', playable: true },
    { id: 18, name: 'Chess', icon: '♟️', file: 'chess.js', playable: true },
    { id: 19, name: 'Solitaire', icon: '🃏', file: 'solitaire.js', playable: true },
    { id: 20, name: 'Trivia', icon: '❓', file: 'trivia.js', playable: true }
];

const STORAGE_KEY = 'gamehub_scores';
const FAVORITES_KEY = 'gamehub_favorites';

class GameHub {
    constructor() {
        this.currentGame = null;
        this.gameInstance = null;
        this.score = 0;
        this.scores = this.loadScores();
        this.favorites = this.loadFavorites();
        this.currentView = 'all';
        
        this.init();
    }

    init() {
        this.renderGames();
        this.bindEvents();
        this.updateTotalScore();
    }

    loadScores() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }

    saveScore(gameId, score) {
        const key = `game_${gameId}`;
        const currentHigh = this.scores[key] || 0;
        
        if (score > currentHigh) {
            this.scores[key] = score;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.scores));
            return true;
        }
        return false;
    }

    getScore(gameId) {
        return this.scores[`game_${gameId}`] || 0;
    }

    loadFavorites() {
        try {
            const data = localStorage.getItem(FAVORITES_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            return [];
        }
    }

    toggleFavorite(gameId) {
        const idx = this.favorites.indexOf(gameId);
        if (idx > -1) {
            this.favorites.splice(idx, 1);
        } else {
            this.favorites.push(gameId);
        }
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(this.favorites));
        this.renderGames();
    }

    isFavorite(gameId) {
        return this.favorites.includes(gameId);
    }

    updateTotalScore() {
        const total = Object.values(this.scores).reduce((sum, s) => sum + s, 0);
        document.getElementById('total-score').textContent = total.toLocaleString();
    }

    renderGames() {
        const grid = document.getElementById('games-grid');
        let gamesToShow = GAMES;

        if (this.currentView === 'favorites') {
            gamesToShow = GAMES.filter(g => this.isFavorite(g.id));
        } else if (this.currentView === 'scores') {
            gamesToShow = GAMES.filter(g => this.getScore(g.id) > 0);
        }

        grid.innerHTML = gamesToShow.map(game => {
            const highScore = this.getScore(game.id);
            const isLocked = !game.playable;
            
            return `
                <div class="game-card ${isLocked ? 'locked' : ''}" data-game-id="${game.id}">
                    <div class="game-icon">${game.icon}</div>
                    <div class="game-title">${game.name}</div>
                    ${highScore > 0 ? `<div class="game-high-score">Récord: <span>${highScore}</span></div>` : ''}
                </div>
            `;
        }).join('');
    }

    bindEvents() {
        document.getElementById('games-grid').addEventListener('click', (e) => {
            const card = e.target.closest('.game-card');
            if (card && !card.classList.contains('locked')) {
                const gameId = parseInt(card.dataset.gameId);
                this.launchGame(gameId);
            }
        });

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentView = btn.dataset.view;
                this.renderGames();
            });
        });

        document.getElementById('back-btn').addEventListener('click', () => this.closeGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('home-btn').addEventListener('click', () => this.closeGame());
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.hideModal();
            this.restartGame();
        });
        
        document.getElementById('modal-home-btn').addEventListener('click', () => {
            this.hideModal();
            this.closeGame();
        });

        document.addEventListener('keydown', (e) => {
            if (this.gameInstance && this.gameInstance.handleKeyDown) {
                this.gameInstance.handleKeyDown(e);
            }
        });

        let touchStartY = 0;
        document.getElementById('game-canvas').addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartY = e.touches[0].clientY;
            if (this.gameInstance && this.gameInstance.handleTouchStart) {
                const rect = e.target.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                const x = (e.touches[0].clientX - rect.left) * scaleX;
                const y = (e.touches[0].clientY - rect.top) * scaleY;
                this.gameInstance.handleTouchStart(x, y, touchStartY);
            }
        });

        document.getElementById('game-canvas').addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.gameInstance && this.gameInstance.handleTouchMove) {
                const rect = e.target.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                const x = (e.touches[0].clientX - rect.left) * scaleX;
                const y = (e.touches[0].clientY - rect.top) * scaleY;
                this.gameInstance.handleTouchMove(x, y);
            }
        });

        document.getElementById('game-canvas').addEventListener('touchend', (e) => {
            if (this.gameInstance && this.gameInstance.handleTouchEnd) {
                this.gameInstance.handleTouchEnd();
            }
        });
    }

    async launchGame(gameId) {
        const game = GAMES.find(g => g.id === gameId);
        if (!game || !game.playable) return;

        this.currentGame = game;
        document.getElementById('game-title').textContent = game.name;
        document.getElementById('game-overlay').classList.remove('hidden');
        
        const canvas = document.getElementById('game-canvas');
        this.setupCanvas(canvas);
        
        try {
            const gameModule = await import(`./games/${game.file}`);
            this.gameInstance = new gameModule.default(canvas, this);
            this.gameInstance.start();
        } catch (e) {
            console.error('Error loading game:', e);
            this.closeGame();
        }
    }

    setupCanvas(canvas) {
        const wrapper = canvas.parentElement;
        const maxWidth = wrapper.clientWidth - 32;
        const maxHeight = wrapper.clientHeight - 32;
        
        const aspectRatio = 9 / 16;
        let width = maxWidth;
        let height = width / aspectRatio;
        
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspectRatio;
        }
        
        canvas.width = 360;
        canvas.height = 640;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
    }

    updateScore(score) {
        this.score = score;
        document.getElementById('current-score').textContent = score;
    }

    gameOver(finalScore) {
        const isNewHigh = this.saveScore(this.currentGame.id, finalScore);
        
        document.getElementById('final-score').textContent = finalScore;
        const hsMsg = document.getElementById('high-score-msg');
        
        if (isNewHigh) {
            hsMsg.classList.add('show');
            this.updateTotalScore();
            this.renderGames();
        } else {
            hsMsg.classList.remove('show');
        }
        
        setTimeout(() => {
            document.getElementById('score-modal').classList.remove('hidden');
        }, 500);
    }

    hideModal() {
        document.getElementById('score-modal').classList.add('hidden');
    }

    restartGame() {
        if (this.gameInstance) {
            this.score = 0;
            document.getElementById('current-score').textContent = '0';
            this.gameInstance.start();
        }
    }

    closeGame() {
        if (this.gameInstance && this.gameInstance.stop) {
            this.gameInstance.stop();
        }
        this.gameInstance = null;
        this.currentGame = null;
        this.score = 0;
        document.getElementById('game-overlay').classList.add('hidden');
        document.getElementById('score-modal').classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.gameHub = new GameHub();
});
