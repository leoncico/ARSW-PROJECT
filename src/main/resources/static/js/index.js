var indexApp = (function () {
    var toggleInput = function() {
        var options = $('#options');
        options.toggle();
        if (options.is(':visible')) {
            options.html(`
                <input id='nameInput' placeholder='Write your name' maxlength="10">
                <button id='confirm'>Continue</button>
            `);
            $('#confirm').click(search);
        } else {
            options.empty();
        }
    }

    var search = function() {
        var name = $('#nameInput').val();
        if(!name){
            alert("Write a valid name");
        }
        else{
            alert("Searching match ...");
        }
    }

    return {
        init: function() {
            $('#findMatch').click(function() {
                toggleInput();
            });
        }
    }
})();
