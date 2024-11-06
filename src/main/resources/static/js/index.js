var indexApp = (function () {

    var tank;
    const pageModal = document.getElementById("modal-overlay");

    // Función para mostrar el modal
    function displayPage() {
        pageModal.style.display = "block"; // Muestra el modal
    }

    // Función para ocultar el modal
    function hidePage() {
        pageModal.style.display = "none"; // Oculta el modal
    }


    var search = function() {
        var username = $('#nameInput').val();
        if (!username) {
            alert("Write a valid name");
        } else {
            alert("Searching match ...");
            $.post("/api/tanks/login", {username: username}, function(response) {
                tank = response;
                window.location.href = "lobby.html";
            }).fail(function() {
                alert("Error");
            });
        }
    };

    return {
        init: function() {
            $('#findMatch').click(function() {
                displayPage();
            });

            // Ejecuta la búsqueda al hacer clic en el botón "Continue"
            $('#confirm').click(function() {
                search();
                hidePage(); // Oculta el modal después de la búsqueda
            });

            // Cierra el modal al hacer clic fuera de él
            $('#modal-overlay').click(function(e) {
                if (e.target === pageModal) {
                    hidePage();
                }
            });
            
        }
    };
})();