export default class Chess {
    constructor(canvas, hub) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.hub = hub;
        this.cellSize = 40;
        this.offsetX = 10;
        this.offsetY = 20;
        this.board = [];
        this.selected = null;
        this.turn = 'white';
        this.score = 0;
        this.isRunning = false;
        this.pieces = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };
    }

    start() {
        this.board = [
            ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
            ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
            ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
        ];
        this.selected = null;
        this.turn = 'white';
        this.score = 0;
        this.isRunning = true;
        this.hub.updateScore(0);
        this.render();
    }

    stop() { this.isRunning = false; }

    select(x, y) {
        if (!this.isRunning) return;
        const col = Math.floor((x - this.offsetX) / this.cellSize);
        const row = Math.floor((y - this.offsetY) / this.cellSize);
        
        if (row < 0 || row > 7 || col < 0 || col > 7) return;
        
        const piece = this.board[row][col];
        const isWhitePiece = piece && piece === piece.toUpperCase();
        const isBlackPiece = piece && piece === piece.toLowerCase();
        
        if (this.selected) {
            if (this.isValidMove(this.selected.row, this.selected.col, row, col)) {
                this.board[row][col] = this.board[this.selected.row][this.selected.col];
                this.board[this.selected.row][this.selected.col] = '';
                this.turn = this.turn === 'white' ? 'black' : 'white';
                this.score += 10;
                this.hub.updateScore(this.score);
                this.selected = null;
            } else if ((isWhitePiece && this.turn === 'white') || (isBlackPiece && this.turn === 'black')) {
                this.selected = { row, col };
            } else {
                this.selected = null;
            }
        } else if (piece && ((isWhitePiece && this.turn === 'white') || (isBlackPiece && this.turn === 'black'))) {
            this.selected = { row, col };
        }
        this.render();
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;
        
        const target = this.board[toRow][toCol];
        const isWhiteTarget = target && target === target.toUpperCase();
        const isBlackTarget = target && target === target.toLowerCase();
        const isWhitePiece = piece === piece.toUpperCase();
        
        if (target && ((isWhitePiece && isWhiteTarget) || (!isWhitePiece && isBlackTarget))) return false;
        
        const dr = toRow - fromRow;
        const dc = toCol - fromCol;
        const absDr = Math.abs(dr);
        const absDc = Math.abs(dc);
        
        const p = piece.toLowerCase();
        
        if (p === 'p') {
            const dir = isWhitePiece ? -1 : 1;
            if (dc === 0 && !target && dr === dir) return true;
            if (absDc === 1 && absDr === 1 && target && ((isWhitePiece && isBlackTarget) || (!isWhitePiece && isWhiteTarget))) return true;
            if (fromRow === (isWhitePiece ? 6 : 1) && dc === 0 && !target && absDr === 2) return true;
            return false;
        }
        
        if (p === 'r') return dr === 0 || dc === 0;
        if (p === 'b') return absDr === absDc;
        if (p === 'q') return dr === 0 || dc === 0 || absDr === absDc;
        if (p === 'n') return (absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2);
        if (p === 'k') return absDr <= 1 && absDc <= 1;
        
        return true;
    }

    render() {
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px Orbitron';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('CHESS', this.canvas.width / 2, 15);

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const x = this.offsetX + c * this.cellSize;
                const y = this.offsetY + r * this.cellSize;
                
                this.ctx.fillStyle = (r + c) % 2 === 0 ? '#769656' : '#eeeed2';
                this.ctx.fillRect(x, y, this.cellSize, this.cellSize);

                if (this.selected && this.selected.row === r && this.selected.col === c) {
                    this.ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
                    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
                }

                const piece = this.board[r][c];
                if (piece) {
                    this.ctx.fillStyle = piece === piece.toUpperCase() ? '#fff' : '#000';
                    this.ctx.font = '28px sans-serif';
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(this.pieces[piece], x + this.cellSize / 2, y + this.cellSize / 2);
                }
            }
        }

        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Orbitron';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Turno: ${this.turn === 'white' ? 'Blancas' : 'Negras'}`, 10, 350);
    }

    handleKeyDown(e) {}

    handleTouchStart(x, y) {
        this.select(x, y);
    }
    handleTouchMove(x, y) {}
    handleTouchEnd() {}
}
