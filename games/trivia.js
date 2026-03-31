export default class Trivia {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.questions = [
            { q: '¿Cuál es la capital de Francia?', a: ['París', 'Londres', 'Madrid', 'Roma'], correct: 0 },
            { q: '¿Cuántos planetas tiene el sistema solar?', a: ['7', '8', '9', '10'], correct: 1 },
            { q: '¿Qué animal es el más grande?', a: ['Elefante', 'Ballena azul', 'Jirafa', 'Tiburón'], correct: 1 },
            { q: '¿Cuántos días tiene un año bisiesto?', a: ['364', '365', '366', '367'], correct: 2 },
            { q: '¿Qué color se obtiene mezclando azul y amarillo?', a: ['Verde', 'Naranja', 'Morado', 'Rojo'], correct: 0 },
            { q: '¿Cuál es el río más largo del mundo?', a: ['Amazonas', 'Nilo', 'Misisipi', 'Yangtsé'], correct: 1 },
            { q: '¿En qué año llegó el hombre a la Luna?', a: ['1965', '1969', '1972', '1975'], correct: 1 },
            { q: '¿Cuántos continentes hay?', a: ['5', '6', '7', '8'], correct: 2 },
            { q: '¿Qué país tiene más población?', a: ['EEUU', 'India', 'China', 'Rusia'], correct: 2 },
            { q: '¿Cuál es el metal más pesado?', a: ['Hierro', 'Oro', 'Plomo', 'Mercurio'], correct: 1 }
        ];
        this.currentQuestion = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.showResult = false;
        this.isRunning = false;
    }

    start() {
        this.currentQuestion = 0;
        this.score = 0;
        this.selectedAnswer = null;
        this.showResult = false;
        this.isRunning = true;
        this.hub.updateScore(0);
        this.render();
    }

    stop() { this.isRunning = false; }

    selectAnswer(index) {
        if (!this.isRunning || this.showResult) return;
        
        this.selectedAnswer = index;
        this.showResult = true;
        
        if (index === this.questions[this.currentQuestion].correct) {
            this.score += 100;
            this.hub.updateScore(this.score);
        }
        
        setTimeout(() => {
            this.currentQuestion++;
            this.selectedAnswer = null;
            this.showResult = false;
            
            if (this.currentQuestion >= this.questions.length) {
                this.gameOver();
            } else {
                this.render();
            }
        }, 1500);
    }

    render() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 22px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('TRIVIA', this.canvas.width / 2, 35);

        this.ctx.font = '14px Rajdhani';
        this.ctx.fillText(`Pregunta ${this.currentQuestion + 1}/${this.questions.length}`, this.canvas.width / 2, 60);

        const q = this.questions[this.currentQuestion];
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Orbitron';
        this.ctx.textAlign = 'center';
        
        const words = q.q.split(' ');
        let line = '';
        let y = 120;
        for (let word of words) {
            if ((line + word).length > 25) {
                this.ctx.fillText(line, this.canvas.width / 2, y);
                line = word + ' ';
                y += 25;
            } else {
                line += word + ' ';
            }
        }
        this.ctx.fillText(line, this.canvas.width / 2, y);

        const btnWidth = 300;
        const btnHeight = 45;
        const startY = 220;
        
        q.a.forEach((answer, i) => {
            const x = (this.canvas.width - btnWidth) / 2;
            const yPos = startY + i * 60;
            
            let bgColor = '#1a1a25';
            if (this.showResult) {
                if (i === q.correct) bgColor = '#06d6a0';
                else if (i === this.selectedAnswer) bgColor = '#ff006e';
            } else if (this.selectedAnswer === i) {
                bgColor = '#333';
            }
            
            this.ctx.fillStyle = bgColor;
            this.ctx.fillRect(x, yPos, btnWidth, btnHeight);
            
            this.ctx.strokeStyle = '#00f5d4';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, yPos, btnWidth, btnHeight);
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '14px Rajdhani';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(answer, x + btnWidth / 2, yPos + btnHeight / 2);
        });

        this.ctx.fillStyle = '#ff006e';
        this.ctx.font = '16px Orbitron';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Puntos: ${this.score}`, 10, 620);
    }

    gameOver() {
        this.isRunning = false;
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#00f5d4';
        this.ctx.font = 'bold 28px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('¡FIN!', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '20px Rajdhani';
        this.ctx.fillText(`Puntuación: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
        setTimeout(() => this.hub.gameOver(this.score), 1500);
    }

    handleKeyDown(e) {}

    handleTouchStart(x, y) {
        if (!this.isRunning || this.showResult) return;
        
        const btnWidth = 300;
        const startY = 220;
        const xStart = (this.canvas.width - btnWidth) / 2;
        
        if (x > xStart && x < xStart + btnWidth) {
            for (let i = 0; i < 4; i++) {
                if (y > startY + i * 60 && y < startY + i * 60 + 45) {
                    this.selectAnswer(i);
                    return;
                }
            }
        }
    }
    handleTouchMove(x, y) {}
    handleTouchEnd() {}
}
