var boardApp = (function(){

    const ROWS = 10;
    const COLS = 15;
    const WALL_PROBABILITY = 0.2;
    const API_URL = '/api/tanks';

    let tanks = new Map();
    let currentTankId = null;
    let gameBoard;
    let username;
    let userTank;
    var stompClient;

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
    
    function getBoard(){
        return new Promise ((resolve, reject) => {
            $.get("/api/tanks/board", function(data) {
                gameBoard = data;
                resolve();
            }).fail(function() {
                alert("There are no tanks");
                reject();
            });
        });
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
    
    function getTanks(){
        return new Promise ((resolve, reject) => {
            $.get("/api/tanks", function(data) {
                data.forEach(tank => {
                    tanks.set(tank.name, tank);
                });
                resolve();
            }).fail(function() {
                alert("There are no tanks");
                reject();
            });
        });
    }

    function placeTanks() {
        console.log(tanks);
        tanks.forEach((value, key) => {
            gameBoard[value.posy][value.posx] = value.name;
        });
        const cells = document.getElementsByClassName('cell');
        tanks.forEach((data) => {
            const tankElement = document.createElement('div');
            tankElement.className = 'tank';
            tankElement.id = `tank-${data.id}`;
            tankElement.style.backgroundColor = data.color;
            const cellIndex = data.posy * COLS + data.posx;
            cells[cellIndex].appendChild(tankElement);
        });
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
    
    function getUsername(){
        return new Promise((resolve, reject) => {
            $.get("/api/tanks/username", function(data) {
                username = data;
                console.log(username);
                resolve();
            }).fail(function() {
                alert("There is no user with that name");
                reject();
            });
        });
    }

    function getTank(){
        return new Promise((resolve, reject) => {
            $.get(`/api/tanks/${username}`, function(tank) {
                userTank = tank; 
                console.log(userTank);
                resolve();
            }).fail(function() {
                alert("There is no user with that name");
                reject();
            });
        });
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

    var subscribe = function(){
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/matches/1/init', function (eventbody) {

            },);
        });
    }

    return {
        init: function() {
            initializeBoard();
            getUsername()
                .then(() => getTank())
                .then(() => subscribe())
                .then(() => getTanks())
                .then(() => placeTanks());
            
        }
    }
})();