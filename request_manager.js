const utils = require('./utils');

exports.exec = async function (file, logger, req) {
    return new Promise(async function (resolve) {
        //Check for any post data
        let postDat;
        if (req.method === 'POST') {
            //load all the post data into the postDat variable as a JSON object
            postDat = await getPostDat(req);
        }

        //this is the file name the user requested
        let fileName = file.replace("/API/","");
        try {
            //TODO: optimise this so we don't use FS for each request
            //Maybe require all the handlers, store in an array, and import the file locally upon init?
            //load the default content for this file
/*
            defaults = fs.readFileSync('./presets/' + fileName);
*/
            //resolve the defaults back to the parent function
            //TODO: load data into the defaults, and return custom data.
            let custom = await require('./handlers/'+fileName).eval(req.headers, postDat);
            resolve(custom);

        }catch (error){
            //user requested an invalid file, therefore make a log of it.
            console.log("FNF ("+fileName+")");
            logger.warn("File Not Found (request manager) ("+fileName+")", error);
            //as this shouldn't happen, we will make them log in again, to force the page to reload.
            //This should fix the issue, as it would be created by the user running their own code// attacker code.
            return resolve(await utils.invalid("Malformed Request #001"));
        }
    })
}

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