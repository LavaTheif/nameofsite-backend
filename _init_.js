//Load in the request manager.
const manager = require('./request_manager');

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
        res.writeHead(200, {'Content-Type': 'text/json',
            'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Headers':'*'});

        if(req.headers['access-control-request-headers'])//just a request header, don't return content.
            return res.end("");

        //TODO: here is where the authentication needs to be done.
        //TODO: if a user is logging in, then allow them to not be authenticated yet.
        //TODO: this should be sent in an Authentication header, and not with the payload body
        if(false){//This is when a users session is invalid.
            return res.end("{\"error\": true, \"message\": \"Please log in. (3FCBE)\"}");
        }

        //This will check that the user is requesting /API/*.json
        if(!file.match(/^\/API\/[A-Za-z]+\.json$/)){
            console.log("User requested invalid file.");
            file = "/API/invalid.json";//not a valid file
        }

        // evaluate and send the payload
        res.end(await manager.exec(file, logger, req));
    };

    var server = http.createServer();
    //TODO: server.setSecure(credentials);
    server.addListener("request", handler);
    server.listen(8079);

}

init();