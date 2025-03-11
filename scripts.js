const gameState = {
    score: 0,
    currentTopic: null,
    wrongAnswers: [],
    questionsAnswered: 0,
    totalQuestions: 8,
    timeLeft: 30
};

const questions = {
    variables: [
        {
            question: "What will be the output of this code?",
            code: "int x = 5;\ndouble y = x / 2;\nSystem.out.println(y);",
            options: ["2.5", "2.0", "2", "Error"],
            correct: "2.0",
            points: 2
        },
        // More questions per topic...
    ],
    oop: [
        {
            question: "Which line contains an error in this class definition?",
            code: "public class Car {\n  private String model;\n  public void setModel(String model) {\n    model = model;\n  }\n}",
            options: ["Line 1", "Line 2", "Line 3", "Line 4"],
            correct: "Line 4",
            points: 2
        }
    ],
    // More topics...
};

// Initialize game
document.addEventListener('DOMContentLoaded', () => {
    const topicButtons = document.querySelectorAll('.topic-btn');
    const submitBtn = document.getElementById('submitBtn');
    const runBtn = document.getElementById('runBtn');
    const stopBtn = document.getElementById('stopBtn');
    const road = document.querySelector('.road');

    topicButtons.forEach(button => {
        button.addEventListener('click', () => startTopic(button.dataset.topic));
    });

    submitBtn.addEventListener('click', checkAnswer);
    
    // Run/Stop buttons functionality as per memory requirements
    runBtn.addEventListener('click', () => {
        road.classList.add('scrolling');
        runBtn.disabled = true;
        stopBtn.disabled = false;
    });

    stopBtn.addEventListener('click', () => {
        road.classList.remove('scrolling');
        runBtn.disabled = false;
        stopBtn.disabled = true;
    });
});

function startTopic(topic) {
    gameState.currentTopic = topic;
    gameState.questionsAnswered = 0;
    document.getElementById('topicSelection').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    loadQuestion();
}

function loadQuestion() {
    if (gameState.questionsAnswered >= gameState.totalQuestions) {
        endTopic();
        return;
    }

    const question = questions[gameState.currentTopic][gameState.questionsAnswered];
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('codeEditor').textContent = question.code;

    const answersContainer = document.getElementById('answers');
    answersContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'answer-btn';
        button.textContent = option;
        button.dataset.index = index;
        button.addEventListener('click', () => selectAnswer(button));
        answersContainer.appendChild(button);
    });

    startTimer();
}

function selectAnswer(button) {
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    button.classList.add('selected');
}

function checkAnswer() {
    const selectedButton = document.querySelector('.answer-btn.selected');
    if (!selectedButton) return;

    const question = questions[gameState.currentTopic][gameState.questionsAnswered];
    const isCorrect = selectedButton.textContent === question.correct;

    if (isCorrect) {
        gameState.score += question.points;
        document.getElementById('score').textContent = gameState.score;
    } else {
        gameState.wrongAnswers.push(gameState.questionsAnswered + 1);
        updateWrongAnswers();
    }

    gameState.questionsAnswered++;
    loadQuestion();
    
    // Check if run/stop buttons should be enabled (score >= 16 and all questions done)
    checkRunStopButtons();
}

function updateWrongAnswers() {
    document.getElementById('wrongList').textContent = 
        gameState.wrongAnswers.join(', ');
}

function checkRunStopButtons() {
    const runBtn = document.getElementById('runBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    // Enable run/stop buttons only if score >= 16 and all questions are answered
    const shouldEnable = gameState.score >= 16 && 
                        gameState.questionsAnswered >= gameState.totalQuestions;
    
    runBtn.disabled = !shouldEnable;
    stopBtn.disabled = true; // Stop button starts disabled until Run is clicked
}

function startTimer() {
    gameState.timeLeft = 30;
    const timerDisplay = document.getElementById('timeLeft');
    
    const timer = setInterval(() => {
        gameState.timeLeft--;
        timerDisplay.textContent = gameState.timeLeft;
        
        if (gameState.timeLeft <= 0) {
            clearInterval(timer);
            checkAnswer(); // Force check current answer when time runs out
        }
    }, 1000);
}

function endTopic() {
    document.getElementById('gameArea').style.display = 'none';
    document.getElementById('leaderboard').style.display = 'block';
    updateLeaderboard();
}

function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    const entry = document.createElement('div');
    entry.className = 'leaderboard-item';
    entry.innerHTML = `
        <span>${gameState.currentTopic.toUpperCase()}</span>
        <span>Score: ${gameState.score}</span>
    `;
    leaderboardList.appendChild(entry);
}

class TetrisGame {
    constructor() {
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.TILE_SIZE = 30;
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.level = 1;
        this.targetScore = 10;
        this.isGameOver = false;
        this.isPaused = false;
        this.currentPiece = null;
        this.currentX = 0;
        this.currentY = 0;
        this.wrongAnswers = [];
        this.allQuestionsAnswered = false;
        this.isScrolling = false;
        
        // Get DOM elements
        this.canvas = document.getElementById('tetris-board');
        this.ctx = this.canvas.getContext('2d');
        this.stopButton = document.getElementById('stop-button');
        this.wrongList = document.getElementById('wrong-list');
        
        this.canvas.width = this.BOARD_WIDTH * this.TILE_SIZE;
        this.canvas.height = this.BOARD_HEIGHT * this.TILE_SIZE;
        
        // Initialize button as disabled
        this.stopButton.disabled = true;
        
        // Tetris pieces (same as Java version)
        this.tetrominoes = [
            [[1, 1, 1, 1]],           // I
            [[1, 1], [1, 1]],         // O
            [[0, 1, 0], [1, 1, 1]],   // T
            [[1, 1, 0], [0, 1, 1]],   // S
            [[0, 1, 1], [1, 1, 0]],   // Z
            [[1, 0, 0], [1, 1, 1]],   // J
            [[0, 0, 1], [1, 1, 1]]    // L
        ];
        
        this.colors = [
            '#00f0f0', // cyan
            '#f0f000', // yellow
            '#a000f0', // purple
            '#00f000', // green
            '#f00000', // red
            '#0000f0', // blue
            '#f0a000'  // orange
        ];

        this.questions = [
            {
                question: "In Java, which class is used to create a file?",
                options: [
                    "File",
                    "FileWriter",
                    "FileReader",
                    "FileCreator"
                ],
                correct: 0
            },
            {
                question: "Which method is used to write data to a file using FileOutputStream?",
                options: [
                    "writeFile()",
                    "write()",
                    "writeBytes()",
                    "writeData()"
                ],
                correct: 1
            },
            {
                question: "What is the correct way to declare a 2D array in Java?",
                options: [
                    "int array[][] = new int[][];",
                    "int[][] array = new int[3][3];",
                    "int[3][3] array = new int;",
                    "array int[][] = new int[3][3];"
                ],
                correct: 1
            },
            {
                question: "Which Java GUI component is used to display multiple lines of text?",
                options: [
                    "JLabel",
                    "JTextField",
                    "JTextArea",
                    "JText"
                ],
                correct: 2
            },
            {
                question: "Which JDBC method is used to execute an SQL query?",
                options: [
                    "executeQuery()",
                    "runQuery()",
                    "submitQuery()",
                    "performQuery()"
                ],
                correct: 0
            },
            {
                question: "In OOP, what is the process of hiding internal details and showing only functionality called?",
                options: [
                    "Inheritance",
                    "Polymorphism",
                    "Encapsulation",
                    "Abstraction"
                ],
                correct: 2
            },
            {
                question: "Which layout manager arranges components in a grid?",
                options: [
                    "FlowLayout",
                    "BorderLayout",
                    "GridLayout",
                    "BoxLayout"
                ],
                correct: 2
            },
            {
                question: "What is the correct way to establish a database connection in Java?",
                options: [
                    "Database.connect(url, username, password);",
                    "DriverManager.getConnection(url, username, password);",
                    "Connection.establish(url, username, password);",
                    "JDBC.connect(url, username, password);"
                ],
                correct: 1
            }
        ];
        
        this.currentQuestionIndex = 0;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.isGameOver && !this.isPaused) {
                switch (e.key) {
                    case 'ArrowLeft':
                        this.movePiece(-1);
                        break;
                    case 'ArrowRight':
                        this.movePiece(1);
                        break;
                    case 'ArrowDown':
                        this.dropPiece();
                        break;
                    case 'ArrowUp':
                        this.rotatePiece();
                        break;
                }
            }
        });

        document.getElementById('start-button').addEventListener('click', () => this.startGame());
        document.getElementById('pause-button').addEventListener('click', () => this.pauseGame());
        document.getElementById('restart-button').addEventListener('click', () => this.startGame());
        
        // Add stop button listener
        if (this.stopButton) {
            this.stopButton.addEventListener('click', () => this.stopScrolling());
        }
    }

    startGame() {
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.level = 1;
        this.targetScore = 10;
        this.isGameOver = false;
        this.isPaused = false;
        this.currentQuestionIndex = 0;
        this.allQuestionsAnswered = false;
        this.isScrolling = false;
        this.wrongAnswers = [];
        this.updateScore();
        this.updateWrongAnswers();
        this.spawnPiece();
        document.getElementById('game-over-modal').classList.remove('show');
        this.stopScrolling();
        this.gameLoop();
    }

    pauseGame() {
        this.isPaused = !this.isPaused;
        document.getElementById('pause-button').textContent = this.isPaused ? 'Resume' : 'Pause';
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('target-score').textContent = this.targetScore;
    }

    spawnPiece() {
        const pieceIndex = Math.floor(Math.random() * this.tetrominoes.length);
        this.currentPiece = {
            shape: this.tetrominoes[pieceIndex],
            color: this.colors[pieceIndex],
            x: Math.floor(this.BOARD_WIDTH / 2) - Math.floor(this.tetrominoes[pieceIndex][0].length / 2),
            y: 0
        };
    }

    movePiece(dx) {
        this.currentPiece.x += dx;
        if (this.checkCollision()) {
            this.currentPiece.x -= dx;
        }
        this.draw();
    }

    dropPiece() {
        this.currentPiece.y++;
        if (this.checkCollision()) {
            this.currentPiece.y--;
            this.placePiece();
            this.checkLines();
            this.spawnPiece();
            if (this.checkCollision()) {
                this.gameOver();
            }
        }
        this.draw();
    }

    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[row.length - 1 - i])
        );
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        if (this.checkCollision()) {
            this.currentPiece.shape = originalShape;
        }
        this.draw();
    }

    checkCollision() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const newX = this.currentPiece.x + x;
                    const newY = this.currentPiece.y + y;
                    if (newX < 0 || newX >= this.BOARD_WIDTH || 
                        newY >= this.BOARD_HEIGHT ||
                        (newY >= 0 && this.board[newY][newX])) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    checkLines() {
        let linesCleared = 0;
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }
        if (linesCleared > 0) {
            this.score += linesCleared * 10;
            this.updateScore();
            if (this.score >= this.targetScore) {
                this.checkScrollingConditions();
                this.askQuestion();
            }
        }
    }

    askQuestion() {
        if (this.currentQuestionIndex < this.questions.length) {
            this.isPaused = true;
            const question = this.questions[this.currentQuestionIndex];
            const modal = document.getElementById('question-modal');
            const questionText = document.getElementById('question-text');
            const optionsContainer = document.getElementById('options-container');
            
            questionText.textContent = question.question;
            optionsContainer.innerHTML = '';
            
            question.options.forEach((option, index) => {
                const button = document.createElement('button');
                button.textContent = option;
                button.addEventListener('click', () => this.checkAnswer(index));
                optionsContainer.appendChild(button);
            });
            
            modal.classList.add('show');
        }
    }

    checkAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestionIndex];
        const modal = document.getElementById('question-modal');
        
        if (selectedIndex === question.correct) {
            // Correct answer - decrease blocks
            this.decreaseBlocks();
        } else {
            // Wrong answer - track it and continue
            this.wrongAnswers.push(this.currentQuestionIndex + 1);
            this.updateWrongAnswers();
        }
        
        this.currentQuestionIndex++;
        
        // Check if all questions are answered
        if (this.currentQuestionIndex >= this.questions.length) {
            this.allQuestionsAnswered = true;
            this.checkScrollingConditions();
        }
        
        this.updateScore();
        modal.classList.remove('show');
        this.isPaused = false;
    }

    updateWrongAnswers() {
        // Display wrong answers at bottom of screen
        if (this.wrongList) {
            this.wrongList.textContent = this.wrongAnswers.length > 0 
                ? `Wrong Questions: ${this.wrongAnswers.join(', ')}` 
                : '';
        }
    }

    checkScrollingConditions() {
        // Start scrolling if score >= 10 AND all questions are answered
        const shouldScroll = this.score >= this.targetScore && this.allQuestionsAnswered;
        
        if (shouldScroll && !this.isScrolling) {
            this.startScrolling();
        }
        
        if (this.stopButton) {
            this.stopButton.disabled = !shouldScroll || !this.isScrolling;
        }
    }

    startScrolling() {
        this.isScrolling = true;
        document.querySelector('.background-scene .road').classList.add('scrolling');
        if (this.stopButton) {
            this.stopButton.disabled = false;
        }
    }

    stopScrolling() {
        this.isScrolling = false;
        document.querySelector('.background-scene .road').classList.remove('scrolling');
        if (this.stopButton) {
            this.stopButton.disabled = true;
        }
    }

    decreaseBlocks() {
        // Remove bottom-most blocks from each column
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
                if (this.board[y][x] !== 0) {
                    this.board[y][x] = 0;
                    break; // Only remove one block per column
                }
            }
        }
        
        // Compact the board by moving blocks down
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
            let writePos = this.BOARD_HEIGHT - 1;
            for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
                if (this.board[y][x] !== 0) {
                    if (writePos !== y) {
                        this.board[writePos][x] = this.board[y][x];
                        this.board[y][x] = 0;
                    }
                    writePos--;
                }
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        for (let y = 0; y < this.BOARD_HEIGHT; y++) {
            for (let x = 0; x < this.BOARD_WIDTH; x++) {
                if (this.board[y][x] !== 0) {
                    this.drawBlock(x, y, this.board[y][x]);
                }
            }
        }
        
        // Draw current piece
        if (this.currentPiece) {
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.drawBlock(
                            this.currentPiece.x + x,
                            this.currentPiece.y + y,
                            this.currentPiece.color
                        );
                    }
                }
            }
        }
    }

    drawBlock(x, y, color) {
        const blockSize = this.TILE_SIZE - 2; // Slightly smaller blocks for spacing
        const xPos = x * this.TILE_SIZE + 1;
        const yPos = y * this.TILE_SIZE + 1;

        // Draw main block
        this.ctx.fillStyle = color;
        this.ctx.fillRect(xPos, yPos, blockSize, blockSize);

        // Draw highlight (top and left edges)
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(xPos, yPos, blockSize, 2); // top
        this.ctx.fillRect(xPos, yPos, 2, blockSize); // left

        // Draw shadow (bottom and right edges)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(xPos + blockSize - 2, yPos, 2, blockSize); // right
        this.ctx.fillRect(xPos, yPos + blockSize - 2, blockSize, 2); // bottom
    }

    gameLoop() {
        if (!this.isGameOver && !this.isPaused) {
            this.dropPiece();
        }
        this.draw();
        setTimeout(() => requestAnimationFrame(() => this.gameLoop()), 500);
    }

    gameOver() {
        this.isGameOver = true;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over-modal').classList.add('show');
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    const game = new TetrisGame();
});
