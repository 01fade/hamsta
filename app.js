var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 3000;

app.use(express.static(__dirname + '/public'));

server.listen(port, function(){
    console.log('>>> Wingardium Leviosa '+ port +' <<<');
});

var users = [];

io.sockets.on('connection', function (socket) {

    console.log(socket.id + ' just connected');
    addUser(socket.id);
    // console.log(socket);


    //REMOTE EVENTS

    socket.on('pairKey', function (data, callback) {
        console.log(socket.id + " has key: " + data);
        for (var i = users.length - 1; i >= 0; i--) {
            if (users[i].id == socket.id) {
                users[i].key = data;
                callback(users[i].id);
            } else if (users[i].partner == socket.id) {
                users[i].id = socket.id;
                users[i].partner = "";
                users[i].key = data;
                callback(users[i].id);
            }
        };
        console.log(users);
    });

    socket.on('matchKey', function (data, callback){
        //
        // Need to fix here, seems like the key is right on screen and remote
        // but comparison here results in wrong
        // maybe implement user rooms, where partners join...
        //
        console.log("matchKey data; " + data);
        var sent = 0;
        for (var i = users.length - 1; i >= 0; i--) {
            if (users[i].key == data) {
                console.log("users[i].key" + users[i].key)
                //set the screen's partner to this mobile id
                users[i].partner = socket.id;
                //set mobile's partner to the screen's id
                for (var j = users.length - 1; j >= 0; j--) {
                    if (users[j].id == socket.id) {
                        users[j].partner = users[i].id;
                        //tell remote to proceed to remotecontrol
                        io.to(users[j].id).emit('matched', {partner: users[i].id});
                        //tell screen to proceed to turn on
                        io.to(users[i].id).emit('matched', {partner: users[j].id});
                        sent ++;
                        //send something back to client
                        callback("right");
                    };
                };
                if (sent == 0){
                    callback("wrong");
                }
            }
        };
        if (sent == 0){
            callback("wrong");
        }
        console.log(users);
    });

    socket.on('remote turn on', function (data, callback) {
        console.log(socket.id + ' has sent: turn on !!!!!');
        io.to(data).emit('turn on');
        callback("go to RemoteControl")
    });

    socket.on('remote turn off', function (data, callback) {
        console.log(socket.id + ' has sent: turn off !!!!!');
        io.to(data.partner).emit('turn off');
        var go = true;
        callback(go);
    });

    socket.on('activechannel', function (data) {
        console.log("activechannel: " + data.activechannel);
        io.to(data.partner).emit('activechannel', {activechannel: data.activechannel});
    });

    socket.on('remote plus', function (data) {
        console.log(socket.id + ' has sent: channel + !!!!!');
        io.to(data.partner).emit('plus');
    });

    socket.on('remote minus', function (data) {
        console.log(socket.id + ' has sent: channel - !!!!!');
        io.to(data.partner).emit('minus');
    });

    socket.on('remote view cart', function (data) {
        console.log(socket.id + ' has sent: view cart !!!!!');
        io.to(data.partner).emit('view cart');
    });

    socket.on('cart content', function (data) {
        console.log(data);
        io.to(data.partner).emit('cart content', {content: data.cart});
    });

    socket.on('remote close cart', function (data) {
        console.log(socket.id + ' has sent: close cart !!!!!');
        io.to(data.partner).emit('close cart');
    });

    socket.on('heart plus', function (data) {
        console.log("<3");
        io.to(data.partner).emit('heart update');
    });

    socket.on('remote volume up', function (data) {
        console.log("volume up");
        io.to(data.partner).emit('volume up');
    });

    socket.on('remote volume down', function (data) {
        console.log("volume down");
        io.to(data.partner).emit('volume down');
    });

    //REMOTE EVENTS END

    socket.on('disconnect', function() {
        console.log(socket.id + ' just disconnected');

        for (var i = users.length - 1; i >= 0; i--) {
            if (users[i].partner === socket.id) {
                users[i].partner = "";
                io.to(users[i].id).emit('refresh');
            };
        };
        removeUser(socket.id);
    });
});

///////////////////////////////////////////////////////////////////

function addUser(user) {
    users.push({"id": user});
    console.log('current users: ' + users.length);
    console.log(users);
    io.emit('get key');
    console.log("get key");
}

function removeUser(user) {
    users.splice(user, 1);
    console.log(user + ' removed');
    console.log('current users: ' + users.length);
    console.log(users);
}