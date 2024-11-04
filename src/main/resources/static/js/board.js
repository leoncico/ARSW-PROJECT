var boardApp = (function(){

    const ROWS = 10;
    const COLS = 15;
    let tanks = new Map();
    let gameBoard;
    let username;
    let userTank;
    var stompClient;

    function initializeBoard() {
        const board = document.getElementById('gameBoard');
        board.innerHTML = '';

        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                if (gameBoard[y][x] === '1') {
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
                alert("Failed to get board");
                reject();
            });
        });
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
            tankElement.id = `tank-${data.name}`;
            tankElement.style.backgroundColor = data.color;
            const cellIndex = data.posy * COLS + data.posx;
            cells[cellIndex].appendChild(tankElement);
        });
    }
    
    function moveTank(direction) {
        if (!userTank) return;
        
        let x = userTank.posx;
        let y = userTank.posy;

        let newPosX = userTank.posx;
        let newPosY = userTank.posy;
    
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
    
        try {
            $.ajax({
                url: `/api/tanks/${username}/move`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify({
                    posX: x,
                    posY: y,
                    newPosX: newPosX,
                    newPosY: newPosY
                }),
                success: function(updatedTank) {
                    userTank = updatedTank;
                    tanks.set(updatedTank.name, updatedTank);
                    gameBoard[y][x] = '0';  // Clear old position
                    gameBoard[newPosY][newPosX] = updatedTank.name;
                    updateTankPosition(updatedTank);
                    console.log('x:'+ x + 'y' + y);
                    console.log('nuevox:'+ newPosX + 'nuievoy' + newPosY);
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
    }

    function updateTankPosition(updatedTank) {
        const tankElement = document.getElementById(`tank-${updatedTank.name}`);
        if (tankElement) {
            const cells = document.getElementsByClassName('cell');
            const newCellIndex = updatedTank.posy * COLS + updatedTank.posx;
            cells[newCellIndex].appendChild(tankElement);
            rotateTank(updatedTank.name, updatedTank.rotation);
            console.log('todo good');
        }
    }
    
    function rotateTank(tankId, degrees) {
        const tank = document.getElementById(`tank-${tankId}`);
        if (tank) {
            tank.style.transform = `translate(-50%, -50%) rotate(${degrees}deg)`;
        }
        console.log('todo bien');
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
            stompClient.subscribe('/topic/matches/1/movement', function (eventbody) {
                
            },);
        });
    }

    return {
        init: function() {
            getUsername()
                .then(() => getBoard())
                .then(() => initializeBoard())
                .then(() => getTank())
                .then(() => subscribe())
                .then(() => getTanks())
                .then(() => placeTanks());
            
        }
    }
})();