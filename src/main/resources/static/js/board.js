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

    // Configuración de balas
    const BULLET_SPEED = 1;
    const BULLET_SIZE = 9;
    const CELL_SIZE = 40;

    let bullets = new Map();

    async function shoot() {
        if (!currentTankId) return;

        const currentTank = tanks.get(currentTankId);
        if (!currentTank) return;

        try {
            const response = await fetch(`${API_URL}/${currentTankId}/shoot`, {
                method: 'POST'
            });
            if (response.ok) {
                const bullet = await response.json();
                bullets.set(bullet.id, bullet);
                createBulletElement(bullet);
            }
        } catch (error) {
            console.error('Error shooting:', error);
        }
    }

     function createBulletElement(bullet) {
         removeBulletElement(bullet.id);

         const bulletElement = document.createElement('div');
         bulletElement.className = 'bullet';
         bulletElement.id = `bullet-${bullet.id}`;

         // Calcular la posición inicial exacta
        const x = bullet.x + (CELL_SIZE / 2);
        const y = bullet.y+ (CELL_SIZE / 2);

         bulletElement.style.cssText = `
             position: absolute;
             width: ${BULLET_SIZE}px;
             height: ${BULLET_SIZE}px;
             background-color: #FF0000;
             border-radius: 50%;
             left: ${x}px;
             top: ${y}px;
             transform: translate(-50%, -50%);
             transition: all 0.05s linear;
             z-index: 100;
         `;

          const cells = document.getElementsByClassName('cell');
             const cellIndex = bullet.y * COLS + bullet.x;

             console.log("inicialy:", bullet.y, "inicialx:", bullet.x);
             if (cellIndex < 0 || cellIndex >= cells.length) {
                 console.error("Índice de celda fuera de los límites:", cellIndex);
                 return;
             }
             cells[cellIndex].appendChild(bulletElement);

         trackBulletPosition(bullet);
     }


     function trackBulletPosition(bullet) {
         let bulletId = bullet.id;
         let attempts = 0;
         const MAX_ATTEMPTS = 50; // Límite de actualizaciones para evitar bucles infinitos

         const updateInterval = setInterval(async () => {
             if (attempts >= MAX_ATTEMPTS) {
                 console.log("Máximo de intentos alcanzado, deteniendo la bala");
                 clearInterval(updateInterval);
                 removeBulletElement(bulletId);
                 bullets.delete(bulletId);
                 return;
             }

             try {
                 const response = await fetch(`${API_URL}/bullets/${bulletId}/position`);
                 if (!response.ok) {
                     throw new Error(`HTTP error! status: ${response.status}`);
                 }

                 const bulletData = await response.json();

                 if (bulletData.alive) {
                     updateBulletPosition(bulletData);
                     console.log("Actualizando posición de la bala #",bulletData.id,"...", bulletData.x, bulletData.y);
                     attempts++;
                 } else {
                     console.log("La bala ha impactado o salió del mapa");
                     clearInterval(updateInterval);
                     createExplosionEffect(bulletData.x, bulletData.y);
                     removeBulletElement(bulletId);
                     bullets.delete(bulletId);
                     return;
                 }
             } catch (error) {
                 console.error('Error tracking bullet:', error);
                 clearInterval(updateInterval);
                 removeBulletElement(bulletId);
                 bullets.delete(bulletId);
             }
         }, 1000); // Actualización más frecuente para movimiento más suave
     }

    // Actualizar posición visual de la bala
     function updateBulletPosition(bullet) {
        const bulletElement = document.getElementById(`bullet-${bullet.id}`);
        if (!bulletElement) return;

        if (gameBoard[bullet.y] && gameBoard[bullet.y][bullet.x] === 0) {
            if (bulletElement) {
                    const cells = document.getElementsByClassName('cell');
                    const newCellIndex = bullet.y * COLS + bullet.x;
                    cells[newCellIndex].appendChild(bulletElement);
            }

        }else {
            console.error("La bala ha salido del tablero:", bullet);
            bullet.alive = false;
            removeBulletElement(bullet.id);
            bullets.delete(bullet.id);
            return;
        }




    }

    // Remover elemento de la bala
     function removeBulletElement(bulletId) {
        const bulletElement = document.getElementById(`bullet-${bulletId}`);
        if (bulletElement) {
            console.log("Eliminando elemento de la bala...");
            bulletElement.remove();
        }
    }

    // Efecto de explosión mejorado
    function createExplosionEffect(x, y) {
        const explosion = document.createElement('div');
        explosion.className = 'explosion';

        const pixelX = x * CELL_SIZE + CELL_SIZE / 2;
        const pixelY = y * CELL_SIZE + CELL_SIZE / 2;

        explosion.style.cssText = `
            position: absolute;
            left: ${pixelX}px;
            top: ${pixelY}px;
            width: 20px;
            height: 20px;
            background-color: #FFA500;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            animation: explode 0.3s ease-out forwards;
            z-index: 101;
        `;

        const board = document.getElementById('gameBoard');
        board.appendChild(explosion);

        // Remover el efecto después de la animación
        setTimeout(() => explosion.remove(), 300);
    }

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
                .then(() => subscribe())
                .then(() => getTanks())
                .then(() => placeTanks());
            
        }
    }
})();