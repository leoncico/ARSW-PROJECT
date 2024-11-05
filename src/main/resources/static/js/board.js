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

    function placeTanks() {
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
    
    let isMoving = false; // Estado de bloqueo

    function moveTank(direction) {
        if (!userTank || isMoving) return; // Si no hay tanque del usuario o está en movimiento, no hacer nada

        isMoving = true; // Activar el bloqueo de movimiento al inicio

        let x = userTank.posx;
        let y = userTank.posy;
        let dir = userTank.rotation;

        let newPosX = x;
        let newPosY = y;

        switch (direction) {
            case 'left':
                newPosX -= 1;
                dir = 180;
                break;
            case 'right':
                newPosX += 1;
                dir = 0;
                break;
            case 'up':
                newPosY -= 1;
                dir = -90;
                break;
            case 'down':
                newPosY += 1;
                dir = 90;
                break;
            default:
                console.error('Dirección inválida:', direction);
                isMoving = false;
                return;
        }

        $.ajax({
            url: `/api/tanks/${username}/move`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                posX: x,
                posY: y,
                newPosX: newPosX,
                newPosY: newPosY,
                rotation: dir
            }),
            success: function(updatedTank) {
                userTank = updatedTank;
                tanks.set(updatedTank.name, updatedTank);
                gameBoard[y][x] = '0'; // Limpiar posición anterior
                gameBoard[newPosY][newPosX] = updatedTank.name;
                updateBoard(updatedTank);
            },
            error: function(jqXHR) {
                if (jqXHR.status === 409) {
                    alert('Movimiento no permitido: colisión detectada en el servidor.');
                } else {
                    console.error('Error al mover el tanque:', jqXHR.statusText);
                }
            },
            complete: function() {
                isMoving = false;
            }
        });
    }

    function updateTankPosition(updatedTank) {
        const tankElement = document.getElementById(`tank-${updatedTank.name}`);
        if (tankElement) {
            const cells = document.getElementsByClassName('cell');
            const newCellIndex = updatedTank.posy * COLS + updatedTank.posx;
            cells[newCellIndex].appendChild(tankElement);
            rotateTank(updatedTank.name, updatedTank.rotation);
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
                console.log("Player: " + username)
                resolve();
            }).fail(function() {
                alert("There is no user with that name");
                reject();
            });
        });
    }

    function updateBoard(username) {
        getBoard()
            .then(() => {
                stompClient.send('/topic/matches/1/movement', {}, JSON.stringify(username));
            })
            .then(() => console.log(gameBoard));
    }

    function updateTanksBoard() {
        const board = document.getElementById('gameBoard');
        const cells = board.getElementsByClassName('cell');
    
        // Limpiar el contenido de cada celda antes de redibujar
        for (let cell of cells) {
            cell.innerHTML = '';
        }
    
        for (let y = 0; y < ROWS; y++) {
            for (let x = 0; x < COLS; x++) {
                const cellIndex = y * COLS + x;
                const cell = cells[cellIndex];
                
                switch (gameBoard[y][x]) {
                    case '1':  // Muro
                        cell.classList.add('wall');
                        break;
                    
                    case '0':  // Espacio vacío
                        cell.classList.remove('wall');
                        break;
                    
                    default:   // Tanque u otro objeto
                        const tankId = gameBoard[y][x];
                        const tankData = tanks.get(tankId);
                        
                        if (tankData) {
                            // Crear el elemento del tanque
                            const tankElement = document.createElement('div');
                            tankElement.className = 'tank';
                            tankElement.id = `tank-${tankId}`;
                            tankElement.style.backgroundColor = tankData.color;
    
                            // Configurar rotación del tanque
                            tankElement.style.transform = `translate(-50%, -50%) rotate(${tankData.rotation}deg)`;
                            
                            // Añadir el tanque a la celda correspondiente
                            cell.appendChild(tankElement);
                        }
                        break;
                }
            }
        }
    }
    

    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'a':
                moveTank('left');
                break;
            case 'd':
                moveTank('right');
                break;
            case 'w':
                moveTank('up');
                break;
            case 's':
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
                const newTankState = JSON.parse(eventbody.body);

                updateTankPosition(newTankState);
            });

            stompClient.subscribe('/topic/matches/1/bullets', function (eventbody) {
                gameBoard = JSON.parse(eventbody.body);
                updateTanksBoard();

                bullets.forEach((intervalId, bulletId) => {
                    clearInterval(intervalId);  // Detener la animación de la bala si ya existe
                    bullets.delete(bulletId);   // Eliminar de la lista de balas activas
                });
            
                // Recorrer la nueva información de balas y animarlas nuevamente
                gameBoard.bullets.forEach(bullet => {
                    animateBullet(bullet.id, bullet.x, bullet.y, bullet.direction);
                });
            });
        });
    }

    
    const BULLET_SPEED = 1;
    const BULLET_SIZE = 9;
    const CELL_SIZE = 40;

    let bullets = new Map();

    function shoot() {
        stompClient.send(`/app/${username}/shoot`, {}, JSON.stringify());
        const startX = userTank.posx;
        const startY = userTank.posy;
        const direction = userTank.rotation;
        const bulletId = `bullet-${Date.now()}`;
        animateBullet(bulletId, startX, startY, direction);

    }

    function calculateBulletPosition(startX, startY, direction, progress) {
        const radians = (direction * Math.PI) / 180;
        const x = startX * CELL_SIZE + Math.cos(radians) * progress;
        const y = startY * CELL_SIZE + Math.sin(radians) * progress;
        return { x, y };
    }

    function animateBullet(bulletId, startX, startY, direction) {
        // Crear el elemento de la bala
        const bullet = document.createElement('div');
        bullet.className = 'bullet';
        bullet.id = `bullet-${bulletId}`;

        // Obtener las celdas del tablero
        const cells = document.getElementsByClassName('cell');
        let currentX = startX;
        let currentY = startY;

        // Colocar la bala en la posición inicial
        const initialCellIndex = currentY * COLS + currentX;
        if (initialCellIndex < 0 || initialCellIndex >= cells.length) {
            console.error("Posición inicial fuera de los límites:", initialCellIndex);
            return;
        }
        cells[initialCellIndex].appendChild(bullet);

        // Calcular los incrementos basados en la dirección
        let dx = 0, dy = 0;
        switch (direction) {
            case 0: // Derecha
                dx = 1;
                break;
            case 90: // Abajo
                dy = 1;
                break;
            case 180: // Izquierda
                dx = -1;
                break;
            case -90: // Arriba
                dy = -1;
                break;
        }

        const intervalId = setInterval(() => {
            // Remover la bala de la celda actual
            bullet.remove();

            // Calcular nueva posición
            currentX += dx;
            currentY += dy;

            // Verificar si la bala está dentro de los límites
            if (currentX < 0 || currentX >= COLS || currentY < 0 || currentY >= ROWS) {
                clearInterval(intervalId);
                bullets.delete(bulletId);
                return;
            }

            const newCellIndex = currentY * COLS + currentX;

            // Verificar si hay una pared o un tanque en la nueva posición
            const cellContent = gameBoard[currentY][currentX];
            if (cellContent === '1') { // Si hay una pared
                clearInterval(intervalId);
                bullets.delete(bulletId);
                return;
            }

            // Mover la bala a la nueva celda
            cells[newCellIndex].appendChild(bullet);
        }, 1000); // Ajusta este valor para cambiar la velocidad de la bala

        bullets.set(bulletId, intervalId);
    }

    const styles = document.createElement('style');
    styles.textContent = `
        .bullet {
            width: 10px;
            height: 10px;
            background-color: #ff0000;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 100;
        }

        .cell {
            position: relative;
        }
    `;
    document.head.appendChild(styles);


    // Agregar evento de disparo (tecla espaciadora)
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            shoot();
        }
    });

    return {
        init: function() {
            getUsername()
                .then(() => getBoard())
                .then(() => initializeBoard())
                .then(() => getTank())
                .then(() => getTanks())
                .then(() => placeTanks())
                .then(() => subscribe());
        }
    }
})();