var indexApp = (function () {

    var tank;

    var toggleInput = function() {
        var options = $('#options');
        options.toggle();
        if (options.is(':visible')) {
            options.append(`
                <input id='nameInput' placeholder='Write your name' maxlength="10">
                <div><button id='confirm'>Continue</button></div>
            `);
            $('#confirm').click(search);
        } else {
            options.empty();
        }
    };

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
                toggleInput();
            });
        }
    };
})();