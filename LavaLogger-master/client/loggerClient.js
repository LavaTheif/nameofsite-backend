/**
@author: LavaTheif
https://github.com/LavaTheif/LavaLogger/README.md

This is the logger client interface, which allows the programs to communicate with the server.
*/

//Initialises some vars
let name, id, _ip='localhost', _port=2222;
// let callback = {};

let last = 0;
//variable delay to wait between sending logs.
let delay = 100;

//initialise the client
exports.init = function(app_name, instance_id, ip, port){
    //remove spaces from the name, and make a local log
    //(we dont save this on the server, as every time it restarts, it will send the same log causing unwanted spam)
    name = app_name.replace(/ /,'-');
    if(app_name.includes(" ")){
        console.log("app name and id must not contain spaces.  Automatically set it to: "+name);
    }
    
    //Same as name
    id = instance_id.replace(/ /,'-');
    if(instance_id.includes(" ")){
        console.log("app name and id must not contain spaces.  Automatically set it to: "+id);
    }

    // callback['app'] = app_name;
    // callback['id'] = instance_id;

    //If the IP and port numbers where passed to the function, set them here.
    if(ip)
        _ip=ip;

    if(port)
        _port = port;

    return this;
}

//save the log to the server
log = function(level, message, data, callback) {
    //set a delay to prevent spamming the database.
    if(last+delay > new Date().getTime()){
        setTimeout(function(){
            log(level, message, data, callback)
        }, last+delay - new Date().getTime());
        return;
    }
    last = new Date().getTime();

    //Store an empty JSON datatype rather than null
    if(!data){
        data = {}
    }
    //Set up the data that we will send to the database.
    let json = {
        level: level,
        message: message,
        data: data,
        callback: callback
    };
    
    //this is for serverless clients, we don't need to send it over sockets as we know where the file is.
    if(_port === -1){
        require('../server/logger.js').log(json);
        return;//don't wanna continue.
    }

    //initialise and connect to a socket hosted by the server.
    let net = require('net');
    let client = new net.Socket();

    client.connect({
        ip: _ip,
        port: _port
    });

    client.on('connect', function () {
        //once we are connected, send the data to the server.
        client.write(JSON.stringify(json));
    });

    client.setEncoding('utf8');

    client.on('data', function (data) {});

    setTimeout(function () {//Make sure we remove the client to prevent leaks.
        client.destroy();
    }, 100);
};

//{app: "testapp", "id": "inst_1", trace: null}

//A function to get the stacktrace.  This needs to be optimised.
getStack = function(){
    try{
        //TODO: optimise so I am not throwing errors
        throw new Error();
    }catch(e) {
        let stack = e.stack.split("\n");
        delete stack[0];
        delete stack[1];
        delete stack[2];
        return stack.join("\n");
    }
}

/*
The following functions set up data to pass to the log function, with the level set depending on the function name.
*/

exports.info = function(message, data, use_stack_trace){
    let c = {app: name, id: id};
    if(use_stack_trace){
        c['trace'] = getStack();
    }
    log(0, message, data, c);
}

exports.warn = function(message, data, use_stack_trace){
    let c = {app: name, id: id};
    if(use_stack_trace){
        c['trace'] = getStack();
    }
    log(1, message, data, c);
}

exports.err = function(message, data, use_stack_trace){
    let c = {app: name, id: id};
    if(use_stack_trace){
        c['trace'] = getStack();
    }
    log(2, message, data, c);
}

exports.critical = function(message, data, use_stack_trace){
    let c = {app: name, id: id};
    if(use_stack_trace){
        c['trace'] = getStack();
    }
    log(3, message, data, c);
}

exports.major = function(message, data, use_stack_trace){
    let c = {app: name, id: id};
    if(use_stack_trace){
        c['trace'] = getStack();
    }
    log(4, message, data, c);
};
