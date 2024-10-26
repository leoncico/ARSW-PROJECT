var indexApp = (function () {
    var toggleInput = function() {
        var options = $('#options');
        options.toggle();
        if (options.is(':visible')) {
            options.append(`
                <input id='nameInput' placeholder='Write your name' maxlength="10">
                <button id='confirm'>Continue</button>
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
            $.post("/matches/login", {username: username}, function() {
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
