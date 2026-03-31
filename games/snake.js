export default class Snake {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.gridSize = 20;
        this.tileCount = canvas.width / this.gridSize;
        this.snake = [];
        this.food = { x: 10, y: 10 };
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.score = 0;
        this.speed = 100;
        this.gameLoop = null;
        this.isRunning = false;
        this.colors = {
            bg: '#0a0a0f',
            snake: '#00f5d4',
            snakeHead: '#00b894',
            food: '#ff006e',
            grid: 'rgba(255,255,255,0.03)',
            text: '#ffffff'
        };
    }

    start() {
        this.snake = [
            { x: 10, y: 10 },
            { x: 10, y: 11 },
            { x: 10, y: 12 }
        ];
        this.direction = { x: 0, y: -1 };
        this.nextDirection = { x: 0, y: -1 };
        this.score = 0;
        this.speed = 100;
        this.placeFood();
        this.isRunning = true;
        this.hub.updateScore(0);
        this.gameLoop = setInterval(() => this.update(), this.speed);
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

        this.direction = { ...this.nextDirection };

        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        if (head.x < 0 || head.x >= this.tileCount ||
            head.y < 0 || head.y >= this.tileCount ||
            this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.hub.updateScore(this.score);
            this.placeFood();
            
            if (this.score % 50 === 0 && this.speed > 50) {
                this.speed -= 5;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }
        } else {
            this.snake.pop();
        }

        this.render();
    }

    placeFood() {
        let valid = false;
        while (!valid) {
            this.food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
            valid = !this.snake.some(seg => seg.x === this.food.x && seg.y === this.food.y);
        }
    }

    render() {
        this.ctx.fillStyle = this.colors.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let x = 0; x < this.tileCount; x++) {
            for (let y = 0; y < this.tileCount; y++) {
                this.ctx.fillStyle = this.colors.grid;
                this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize - 1, this.gridSize - 1);
            }
        }

        this.ctx.fillStyle = this.colors.food;
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            this.gridSize / 2 - 2,
            0, Math.PI * 2
        );
        this.ctx.fill();

        this.snake.forEach((seg, i) => {
            this.ctx.fillStyle = i === 0 ? this.colors.snakeHead : this.colors.snake;
            this.ctx.fillRect(
                seg.x * this.gridSize + 1,
                seg.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
        });
    }

    gameOver() {
        this.isRunning = false;
        clearInterval(this.gameLoop);
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = 'bold 32px Orbitron, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.font = '20px Rajdhani, sans-serif';
        this.ctx.fillText(`Puntuación: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        
        setTimeout(() => this.hub.gameOver(this.score), 1000);
    }

    handleKeyDown(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.direction.y !== 1) this.nextDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.direction.y !== -1) this.nextDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.direction.x !== 1) this.nextDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.direction.x !== -1) this.nextDirection = { x: 1, y: 0 };
                break;
        }
    }

    handleTouchStart(x, y, startY) {
        this.touchStartY = startY;
    }

    handleTouchMove(x, y) {
    }

    handleTouchEnd() {
    }
}
