//Load in the request manager.
const manager = require('./request_manager');
const utils = require('./utils');

//TODO: Change to port 443 from 8079

// let db_manager = require('./db_manager/manager');
// db_manager.generate();

//initialise logger API to keep track of errors and warnings.
//This is open sourced at https://github.com/LavaTheif/LavaLogger/ and is written and maintained by me.
const logger = require('./LavaLogger-master/loggerServerless.js').init("NameOfSite_server", "server-inst-0");

//This function initialises the server.  It sets up the listeners and loads the relevant data into the program.
function init(){
    //sets up a http server for clients to request data.
    //TODO: Force HTTPS
    const http = require("http");
    let handler = async function (req, res) {
        let file = req.url;

        //Write headers
        //TODO: when pushing to production, change from *
        // res.setStatus(200);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');

        //TODO: check for options request. (I think???)
        if(req.headers['access-control-request-headers'])//just a request header, don't return content.
            return res.end("");

        if(file === '/API/invalid.json'){
            //just a little easter egg I guess
            return res.end(await utils.invalid('So, you wondered if you could request the internal error file. ' +
                'I like your style.'));
        }

        //This will check if the user is requesting /API/*.json
        if(file.match(/^\/API\/[A-Za-z]+\.json$/)){
            //only POST
            if (req.method === 'POST') {
                //evaluate and send the payload
                res.setHeader('Content-Type', 'text/json');
                let data = await manager.exec(file, logger, req);
                if (typeof data === typeof {})
                    data = JSON.stringify(data);
                return res.end(data);
            }
        }else if(file.match(/^\/images\/.*$/)){
            //Check if the user is requesting /images/*
            //only GET
            if (req.method === 'GET') {
                const fs = require('fs');
                // function to encode file data to base64 encoded string
                function base64_encode(file) {
                    // read binary data
                    let img = fs.readFileSync(file);
                    // convert binary data to base64 encoded string
                    return new Buffer.from(img).toString('base64');
                    //TODO: Would save to DB here
                }

                let image = base64_encode('/home/charlie/Documents/'+file.replace('/images/',""));
                res.setHeader('Content-Type', 'image/png');
                return res.end(Buffer.from(image, 'base64'));
            }
        }else if(file.match(/^\/upload\/$/)){
            //Check if the user is requesting /images/*
            //only POST
            if (req.method === 'POST') {
                const fs = require('fs');
                // function to encode file data to base64 encoded string
                function base64_encode(file) {
                    // read binary data
                    let img = fs.readFileSync(file);
                    // convert binary data to base64 encoded string
                    return new Buffer.from(img).toString('base64');
                    //TODO: Would save to DB here
                }

                let image = base64_encode('/home/charlie/Documents/meme.png');
                res.setHeader('Content-Type', 'image/png');
                return res.end(Buffer.from(image, 'base64'));
            }
        }
        console.log("User requested invalid file: "+file);
        return res.end(await utils.invalid('404'));

    };

    var server = http.createServer();
    //TODO: server.setSecure(credentials); //<-- afaik ssl
    server.addListener("request", handler);
    server.listen(8079);

}

init();