const utils = require('./utils');
const commons = require('./commons');

exports.exec = async function (file, logger, req) {
    return new Promise(async function (resolve) {
        //Check for any post data
        let postDat;
        if (req.method === 'POST') {
            //load all the post data into the postDat variable as a JSON object
            postDat = await getPostDat(req);
        }else{
            //This action requires post data.
            //None was provided. Return a malformed request error.
            return resolve(commons.noPost());
        }
        //this is the file name the user requested
        let fileName = file.replace("/API/","");

        //signup and login are up here as they require no authentication
        if(fileName==="login.json"){
            return resolve(await require('./handlers/login.json').eval(req.headers, postDat));
        }else if(fileName==="signup.json"){
            return resolve(await require('./handlers/signup.json').eval(req.headers, postDat));
        }

        //get the users JWT and Refresh tokens
        //should be sent in headers, and not with the payload body
        let token = req.headers['jwt'];
        let refresh = req.headers['refresh'];
        let newToken = null;

        //validate their JWT
        let validation = await commons.validateJWT(token);

        // here is where the authentication is checked.
        if(validation.error){
            //User has supplied an invalid token.
            //Attempt to generate a new token with the refresh token
            newToken = await commons.issueNewToken(refresh);
            if(newToken.error){
                //invalid refresh token.
                //User must log in to generate a new token
                return resolve(newToken);
            }else{
                //User supplied a valid refresh token
                //therefore it has generated a new token
                postDat.uid = newToken.uid;
                //set the newToken variable to this token;
                newToken = newToken.token;
            }
        }else{
            //Valid token, set the users id to the one from the token.
            postDat.uid = validation.body.uid;
        }

        try {
            //Evaluate the users request and store the data in the 'evalData' variable
            let evalData = await require('./handlers/'+fileName).eval(req.headers, postDat);
            if(newToken){
                //If we have a new token for the user
                //then we add it to the data that will be returned here
                evalData['jwt'] = newToken;
            }
            //resolve back to client.
            return resolve(evalData);

        }catch (error){
            //user requested an invalid file, therefore make a log of it.
            console.log("FNF ("+fileName+")");
            logger.warn("File Not Found (request manager) ("+fileName+")", error);
            //as this shouldn't happen, we will make them log in again, to force the page to reload.
            //This should fix the issue, as it would be created by the user running their own code// attacker code.
            return resolve(await utils.invalid("Malformed Request #001"));
        }
    })
};

//gets the content of the post data.
async function getPostDat(req) {
    return new Promise(function (resolve) {
        let body = '';

        req.on('data', function (data) {
            body += data;

            // Too much data sent
            if (body.length > 1e6)
                req.connection.destroy();
        });

        //resolve the data back to the parent function, returning it as a JSON object
        req.on('end', function () {
            if (body){
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve({})
                }
            }else{
                resolve({});
            }
        });
    })
}