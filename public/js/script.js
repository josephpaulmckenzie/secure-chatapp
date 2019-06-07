$(() => {
    // Helper Functions
    function messageTemplate(username, user, msg, color) {
        /* template for chat message */
        let tag = "<div class='chatMessage " + user + "'>" +
            "<h3 style='color:" + color + "'>" + username + " </h3>" + "<p>" + msg + "</p></div>";
        return tag;
    }

    function joinTemplate(username) {
        /* template for new user joining */
        let tag = "<div class='joinMessage'><p class='center join'>" + username + "has joined the chat.</p></div>";
        return tag;
    }

    function callModal() {
        /* Modal Controls */

        $("#usernameModal").modal({
            backdrop: 'static',
            keyboard: false
        });
        $('#usernameModal').on('shown.bs.modal', function () {
            $('#username').focus();
        });
        $("#usernameModal").modal('show');
    }

    function validateUsername() {
        /* Check that username is not empty */

        $("#usernameForm").submit((e) => {
            e.preventDefault();

            let username = $("#username").val();
            
            if (username == '') {
                $(".error-msg").html("You must enter a username!");
            } else {
                currentUser = username;
                users.push(currentUser);
                $("#usernameModal").modal('hide');
                $("#message").focus();

                socket.emit("join", currentUser);
            }
        });
    }

    function sendMessage() {
        /* sends a message */
        $("#messageForm").submit((e) => {
            e.preventDefault();

            // send message to other users
            let user = currentUser;
            let message = $("#message").val();
            let msg = {
                "user": user,
                "message": message
            };
            socket.emit('msg', msg);

            $("#message").val('');

            // set chat color
            let index = users.indexOf(user);
            if (index == -1) {
                users.push(user);
                index = colorCount % chatColors.length;
                colorCount += 1;
            }

            // add message to chatbox
            $(messageTemplate(currentUser, 'currentUser', message, chatColors[index])).appendTo("#chatBox");

            var chatBox = document.getElementById("chatBox");
            chatBox.scrollTop = chatBox.scrollHeight;
            return false;
        });
    }

    var PageTitleNotification = {
        Vars: {
            OriginalTitle: document.title,
            Interval: null
        },
        On: function (notification, intervalSpeed) {
            var _this = this;
            _this.Vars.Interval = setInterval(function () {
                document.title = (_this.Vars.OriginalTitle == document.title) ?
                    notification :
                    _this.Vars.OriginalTitle;
            }, (intervalSpeed) ? intervalSpeed : 1000);
        },
        Off: function () {
            clearInterval(this.Vars.Interval);
            document.title = this.Vars.OriginalTitle;
        }
    }

    function getMessage() {
        /* Shows the message sent by some other user on the screen */
        socket.on('msg', (msg) => {
            // set chat color

            PageTitleNotification.On(msg.user + " messaged");
            var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
            snd.play();
            let index = users.indexOf(msg.user);
            if (index == -1) {
                users.push(msg.user);
                index = colorCount % chatColors.length;
                colorCount += 1;
            }
            $(messageTemplate(msg.user, 'otherUser', msg.message, chatColors[index])).appendTo("#chatBox");

            var chatBox = document.getElementById("chatBox");

            chatBox.scrollTop = chatBox.scrollHeight;
        });
    }

    function sendUserTyping() {
        /* tells others that the current user is typing */
        $("#message").on('keypress', () => {
            socket.emit('userTyping', currentUser);
        });
    }

    var count = 0;
    var myInterval;
    // Active
    window.addEventListener('focus', startTimer);

    // Inactive
    window.addEventListener('blur', stopTimer);

    function timerHandler() {
        count++;

        console.log(count);
        if (count >= 10) {
            count = 0;

            var div = document.getElementById('chatBox');
            while (div.firstChild) {
                div.removeChild(div.firstChild);
            }
        }
    }

    // Start timer
    function startTimer() {
        console.log('focus');
        PageTitleNotification.Off("");

        myInterval = window.setInterval(timerHandler, 1000);
     
    }

    // Stop timer
    function stopTimer() {
        count = 0;

        window.clearInterval(myInterval);
    }

    function showUserTyping() {
        /* displays on the screen which user is typing */
        socket.on('userTyping', (username) => {
            $("#userTyping").html(username + " is typing...");
            var timeout = setTimeout(() => {
                $("#userTyping").html('');
            }, 1000);

            function calledAgain() {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    $("#userTyping").html('');
                }, 1000);
            }
            calledAgain();
        });
    }

    function showWhichUserJoin() {
        /* Shows on the screen which user joined the chatroom */
        socket.on('join', (username) => {
            $(joinTemplate(username)).appendTo("#chatBox");
        });
    }

    

    // initialize socket
    var socket = io();

    // current user's username
    var currentUser = '';

    // set chat colors
    var chatColors = [
        '#F44336',
        '#673AB7',
        '#EF6C00',
        '#795548',
        '#607D8B',
        '#004D40',
        '#880E4F',
        '#FFC107',
        '#03A9F4',
        '#1A237E'
    ];
    var colorCount = 1;
    var users = [];

    // call Modal for username
    callModal();

    // validates username when modal is submitted
    validateUsername();

    // sends a message to other users
    sendMessage();

    // receive message from user and display on screen
    getMessage();

    // tells others that current user is typing
    sendUserTyping();

    // displays on the screen which user is typing currently
    showUserTyping();

    // displays on the screen which user joined the chat room
    showWhichUserJoin();
});