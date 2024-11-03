var boardApp = (function(){

    const ROWS = 10;
    const COLS = 15;
    const WALL_PROBABILITY = 0.2;
    const API_URL = '/api/tanks';

    let tanks = new Map();
    let currentTankId = null;
    let gameBoard;

    async function initializeGame() {
        console.log("Inicializando el juego...");
        initializeBoard();
        await createTank();
    }
    
    // Inicializar el tablero
    function initializeBoard() {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';
        gameBoard = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1],
            [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';

                if (gameBoard[y][x] === 1) {
                    cell.classList.add('wall');
                }

                board.appendChild(cell);
            }
        }
    }
    
    async function createTank() {
        try {
            const response = await fetch(`/api/tanks`, {
                method: 'GET'
            });
            const tank = await response.json();
            console.log(tank);
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
                $.ajax({
                    url: `/api/tanks/${currentTankId}/move`,
                    type: 'PUT',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        posX: newPosX,
                        posY: newPosY
                    }),
                    success: function(updatedTank) {
                        tanks.set(updatedTank.id, updatedTank);
                        updateTankPosition(updatedTank);
                    },
                    error: function(jqXHR) {
                        if (jqXHR.status === 409) {
                            alert('Movimiento no permitido: colisión detectada en el servidor.');
                        } else {
                            console.error('Error al mover el tanque:', jqXHR.statusText);
                        }
                    }
                });
    
            } catch (error) {
                console.error('Error moving tank:', error);
            }
        } else {
            alert('No puedes cruzar por las paredes');
        }
    }
    
    // Actualizar la posición del tanque en el tablero
    function updateTankPosition(tank) {
        console.log("xd");
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


    return {
        init: function() {
            initializeGame();
        }
    }
})();



// setInterval(async () => {
//     try {
//         const response = await fetch("/api/tanks");
//         const allTanks = await response.json();
//         allTanks.forEach(tank => {
//             if (!tanks.has(tank.id)) {
//                 tanks.set(tank.id, tank);
//                 placeTank(tank);
//             } else {
//                 updateTankPosition(tank);
//             }
//         });
//     } catch (error) {
//         console.error('Error updating tanks:', error);
//     }
// }, 1000);