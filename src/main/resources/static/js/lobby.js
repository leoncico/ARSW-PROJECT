var lobbyApp = (function () {
    var username;
    var stompClient;
    var tanksElem;
    var tankList;

    var getUsernameFromSession = function() {
        return $.get("/api/matches/username")
            .done(function(data) {
                username = data;
                console.log("User:", username);
            })
            .fail(function() {
                console.error("Username not found in session");
            });
    };

    var loadTanks = function() {
        return new Promise((resolve, reject) => {
            $.get("/api/matches/tanks")
                .done(function(tanks) {
                    tankList = tanks;
                    displayTanks(tanks);
                    console.log(tanksElem.length);
                    resolve(tanks); // Resuelve la promesa con los tanques cargados
                })
                .fail(function() {
                    console.error("Error fetching tanks");
                    reject("Error fetching tanks"); // Rechaza la promesa en caso de error
                });
        });
    };

    var subscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        return new Promise((resolve, reject) => {
            stompClient.connect({}, function (frame) {
                console.log('Connected: ' + frame);
                stompClient.subscribe(`/topic/matches/1`, function (eventbody) {
                    loadTanks().then((tanks) => {
                        // Este código se ejecuta una vez que loadTanks se complete
                        if (tankList.length >= 3) {
                            alert("Starting match");
                            window.location.href = "board.html";
                        }
                    }).catch((error) => {
                        console.error(error); // Manejo de errores si loadTanks falla
                    });
                });
                resolve();
            }, function(error) {
                reject(error);
            });
        });
    };

    var displayTanks = function(tanks) {
        tanksElem = $('#tanksElem');
        tanksElem.empty();

        tanks.forEach(function(tank) {
            tanksElem.append(`<li>${tank.name}</li>`);
        });
    };

    var connect = function() {
        stompClient.send("/topic/matches/1", {}, JSON.stringify(username));
    }

    return {
        init: function() {
            getUsernameFromSession()
                .then(() => loadTanks()) // Cambia el orden para cargar tanques después de obtener el username
                .then(() => subscribe())
                .then(() => connect())
                .catch((error) => console.error("Error in initialization:", error));
        }
    };
})();
