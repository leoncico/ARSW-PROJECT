// Configuración del juego
const ROWS = 10;
const COLS = 15;
const WALL_PROBABILITY = 0.2;
const API_URL = '/api/tanks';

// Estado del juego
let tanks = new Map();
let currentTankId = null;
let gameBoard = [];


async function initializeGame() {
    console.log("Inicializando el juego...");
    initializeBoard();
    await createTank();
}

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
}

async function createTank() {
    try {
        const response = await fetch(`api/create`, {
            method: 'POST'
        });
        const tank = await response.json();
        currentTankId = tank.id;
        tanks.set(tank.id, tank);
        placeTank(tank);
    }catch (error) {
        console.error("No se pudo crear tanque :c",error);
    }
}

function placeTank(tank) {
    if (!tank) {
        console.error("No se proporcionó un tanque válido.");
        return;
    }

    // Verificar que las coordenadas del tanque estén dentro de los límites
    if (tank.posy < 1 || tank.posy >= ROWS - 1 || tank.x < 1 || tank.x >= COLS - 1) {
        console.error("Posición del tanque fuera de los límites del tablero:", tank);
        return;
    }

    const tankElement = document.createElement('div');
    tankElement.className = 'tank';
    tankElement.id = `tank-${tank.id}`;
    tankElement.style.backgroundColor = tank.color;

    const cells = document.getElementsByClassName('cell');
    const cellIndex = tank.posy * COLS + tank.posx;

    // Verificar el valor de cellIndex
    console.log("Índice de celda calculado:", cellIndex);
    console.log("y:", tank.posy, "x:", tank.posx);

    // Verificar que cellIndex sea válido
    if (cellIndex < 0 || cellIndex >= cells.length) {
        console.error("Índice de celda fuera de los límites:", cellIndex);
        return;
    }

    cells[cellIndex].appendChild(tankElement);
    rotateTank(tank.id, tank.rotation);
}

// Mover el tanque
async function moveTank(direction) {
    if (!currentTankId) return;

    // Obtener el tanque actual
    const currentTank = tanks.get(currentTankId);
    if (!currentTank) return;

    // Calcular la nueva posición según la dirección
    let newPosX = currentTank.posx;
    let newPosY = currentTank.posy;

    switch (direction) {
        case 'left':
            newPosX -= 1;
            break;
        case 'right':
            newPosX += 1;
            break;
        case 'up':
            newPosY -= 1;
            break;
        case 'down':
            newPosY += 1;
            break;
        default:
            console.error('Dirección inválida:', direction);
            return;
    }

    // Verificar colisiones antes de hacer el fetch
    if (gameBoard[newPosY] && gameBoard[newPosY][newPosX] === 0) {
        try {
            const response = await fetch(`/api/tanks/${currentTankId}/move?direction=${direction}`, {
                method: 'PUT'
            });

            if (response.ok) {
                const updatedTank = await response.json();
                tanks.set(updatedTank.id, updatedTank);
                updateTankPosition(updatedTank);
            } else if (response.status === 409) {
                alert('Movimiento no permitido: colisión detectada en el servidor.');
            } else {
                console.error('Error al mover el tanque:', response.statusText);
            }
        } catch (error) {
            console.error('Error moving tank:', error);
        }
    } else {
        alert('No puedes cruzar por las paredes');
    }
}

// Actualizar la posición del tanque en el tablero
function updateTankPosition(tank) {
    const tankElement = document.getElementById(`tank-${tank.id}`);
    if (tankElement) {
        const cells = document.getElementsByClassName('cell');
        const newCellIndex = tank.posy * COLS + tank.posx;
        cells[newCellIndex].appendChild(tankElement);
        rotateTank(tank.id, tank.rotation);
    }
}

function rotateTank(tankId, degrees) {
    const tank = document.getElementById(`tank-${tankId}`);
    if (tank) {
        tank.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    // Tu código aquí
    initializeGame();
});

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

setInterval(async () => {
    try {
        const response = await fetch("/api/tanks");
        const allTanks = await response.json();
        allTanks.forEach(tank => {
            if (!tanks.has(tank.id)) {
                tanks.set(tank.id, tank);
                placeTank(tank);
            } else {
                updateTankPosition(tank);
            }
        });
    } catch (error) {
        console.error('Error updating tanks:', error);
    }
}, 1000);