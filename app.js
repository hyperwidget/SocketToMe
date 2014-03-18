
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);

//Route for index
app.get('/', routes.index);

//Start that mutha
server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//set up socketio
var io = require('socket.io').listen(server);

//Track active users
var activeUsers = 0;

//Socket stuff
io.sockets.on('connection', function (socket) {
    //Keep track of active users on the site
    activeUsers++;
    io.sockets.emit('userUpdate', {userCount: activeUsers});

    // When each user connects, assign them 10 random numbers between 1 and 30
    // Don't add duplicate numbers
    // The client will then build 10 rows with buttons in them.
    var data = {};
    data.rows = [];
    var randomNumbers = [];
    while(data.rows.length < 10){
        tempValue = Math.floor(Math.random() * 30) + 1;
        if(randomNumbers.indexOf(tempValue) === -1){
            randomNumbers.push(tempValue);
            data.rows.push({rowNumber: tempValue})
        }
    }
    socket.emit('init', data);

    //After a button has been pressed in a row, send that message to all users
    socket.on('buttonPressed', function (data) {
        //Persist Data in DB
        io.sockets.emit('setStatus', data);
    });

    //set all button 2s on all clients to active and send a message to display
    socket.on('setDefault', function(data){
        io.sockets.emit('setDefault', {msg:'I love you', button: 'button2'});
    });

    //Clear all current button selections
    socket.on('clear', function(data){
        io.sockets.emit('clear',{});
    });

    //Update active users when someone disconnects and emit
    socket.on('disconnect', function(){
       activeUsers--;
        io.sockets.emit('userUpdate', {userCount: activeUsers});
    });
});
