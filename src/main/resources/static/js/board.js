// Configuración del juego
const ROWS = 10;
const COLS = 15;
const WALL_PROBABILITY = 0.2;

// Estado del juego
let tankPosition = { x: 1, y: 1 };
let gameBoard = [];

// Inicializar el tablero
function initializeBoard() {
    const board = document.getElementById('gameBoard');
    board.innerHTML = '';
    gameBoard = [];

    for (let y = 0; y < ROWS; y++) {
        gameBoard[y] = [];
        for (let x = 0; x < COLS; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';

            // Asegurarse de que los bordes sean paredes
            if (x === 0 || x === COLS-1 || y === 0 || y === ROWS-1) {
                cell.classList.add('wall');
                gameBoard[y][x] = 1;
            } else {
                // Generar paredes aleatorias en el interior
                if (Math.random() < WALL_PROBABILITY && !(x === 1 && y === 1)) {
                    cell.classList.add('wall');
                    gameBoard[y][x] = 1;
                } else {
                    gameBoard[y][x] = 0;
                }
            }
            board.appendChild(cell);
        }
    }

    // Agregar el tanque
    placeTank();
}

// Colocar el tanque en el tablero
function placeTank() {
    const tank = document.createElement('div');
    tank.className = 'tank';
    tank.id = 'tank';

    const cells = document.getElementsByClassName('cell');
    const cellIndex = tankPosition.y * COLS + tankPosition.x;
    cells[cellIndex].appendChild(tank);
}

// Mover el tanque
function moveTank(direction) {
    let newX = tankPosition.x;
    let newY = tankPosition.y;

    switch(direction) {
        case 'left':
            newX--;
            rotateTank(-90);
            break;
        case 'right':
            newX++;
            rotateTank(90);
            break;
        case 'up':
            newY--;
            rotateTank(0);
            break;
        case 'down':
            newY++;
            rotateTank(180);
            break;
    }

    // Verificar colisiones
    if (!gameBoard[newY][newX]) {
        tankPosition.x = newX;
        tankPosition.y = newY;

        const tank = document.getElementById('tank');
        const cells = document.getElementsByClassName('cell');
        const newCellIndex = newY * COLS + newX;
        cells[newCellIndex].appendChild(tank);
    }
}

// Rotar el tanque
function rotateTank(degrees) {
    const tank = document.getElementById('tank');
    tank.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;
}

// Iniciar el juego
initializeBoard();

// Controles de teclado
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'ArrowLeft':
            moveTank('left');
            break;
        case 'ArrowRight':
            moveTank('right');
            break;
        case 'ArrowUp':
            moveTank('up');
            break;
        case 'ArrowDown':
            moveTank('down');
            break;
    }
});