/**
@author: LavaTheif
https://github.com/LavaTheif/LavaLogger/README.md

This is the logger server entry point.
*/

//Entry point for the logger server.  Run this file in node.js

//Starts up the socket server and initialise some variables
let net = require('net');
let server = net.createServer();
let logger = require("./logger");

const fs = require('fs');
let config = JSON.parse(fs.readFileSync('./config.json'));

//With mongoose, we need to initialise the database, which we can just save in the config temporarily.
if(config.db_type === 'mongoose'){
	(async () => {
		config = await require('./database/init_mongo.js').exec(config);
	})();
}

//basic server stuff to set up a socket.
server.on('connection',function(socket){
    socket.setEncoding('utf8');

    socket.setTimeout(100);

    socket.on('data',function(data){
	//when the socket recieves data, save it to the database using the logger interface.
        logger.log(data, config);
    });

    socket.on('error',function(error){
        console.log('Error : ' + error);
    });

    socket.on('close',function(error){});

    setTimeout(function(){
        socket.destroy();
    },100);

});

server.on('error',function(error){
    console.log('Error: ' + error);
});

server.on('listening',function(){
    console.log('Server is listening!');
});

//change this so more clients can send their logs.
server.maxConnections = 15;
server.listen(config.server_port);
