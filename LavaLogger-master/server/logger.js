/**
@author: LavaTheif
https://github.com/LavaTheif/LavaLogger/README.md

This is the logger server interface to manage the incomming logs.
*/

//initialise some variables.
let levels = {0:'info', 1:'warn', 2:'error', 3:'critical', 4:'major', 5:'internal'};//This is in multiple files, so should be changed elsewhere too

let config;
let last_query = 0;


exports.log = function(json, c){
    if(!config){//have we loaded the config?
        if(!c) {//has the config been passed to the function?
            const fs = require('fs');//No to both, so we will load it in here
            let rawdata = fs.readFileSync('./config.json');
            config = JSON.parse(rawdata);
        }else{
            config = c;//Set it to the value passed to the function.
        }
    }
    
    //prevents spam to the database, can be changed
    let delay = 100;
    if(last_query+delay > new Date().getTime()){
        setTimeout(function(){
            exports.log(json, c)
        }, last_query+delay - new Date().getTime());
        return;
    }
    last_query = new Date().getTime();

    //check what database we are going to use.
    let db_type = config.db_type;

    //checks if we need to parse the JSON into an object
    if(typeof json !== typeof {}){//cant remember if it's Object or object, so I will just use typeof {}
        json = JSON.parse(json);
    }

    //get the callback data
    let callback = json.callback;
    if(!callback){//we dont have the data, so set the app and id to unknown.
        callback = {app: "unknown", id: "unknown"};
        internal_log("Logger called with no app or id set.", null, null);//log this incident
    }
    if(!callback.app){//we dont have an app name, so set it to unknown
        callback['app'] = "unknown";
        internal_log("Logger called with no app set.", null, null);//log this incident
    }
    if(!callback.id){//we dont have an id, so set it to unknown
        callback['id'] = "unknown";
        internal_log("Logger called with no id set.", null, null);//log this incident
    }
    json.callback = callback;//set the json callback to the updated data

    // console.log(db_type)
    //get the database, and save the json data using the config settings.
    require(`./database/${db_type}.js`).save(json, config);
}

//logs an internal error or warning.
function internal_log(message, data, includeStack) {
    try{
        //TODO: optimise so I am not throwing errors
        throw new Error();
    }catch(e){
        let stack = e.stack.split("\n");
        delete stack[0];
        delete stack[1];
        if(!includeStack){
            stack = null;
        }else{
            stack = stack.join("\n");
        }
        //The level is set to 5, which is internal.  It also has a custom app and id name to prevent it spamming other program logs.
        exports.log({level: 5, message:message, data: data, callback: {app: "logger_internal", "id":"logger_internal", trace:stack}});
    }
}
