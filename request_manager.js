exports.exec = async function (file, logger, req) {
    return new Promise(async function (resolve) {
        const fs = require('fs');

        //Check for any post data
        let postDat;
        if (req.method === 'POST') {
            //load all the post data into the postDat variable as a JSON object
            postDat = await getPostDat(req);
        }

        //this is the file name the user requested
        let fileName = file.replace("/API/","");
        let defaults;
        try {
            //load the default content for this file
            defaults = fs.readFileSync('./presets/' + fileName);

        }catch (error){
            //user requested an invalid file, therefore make a log of it.
            logger.warn("File Not Found (request manager) ("+fileName+")", error);
            console.log("FNF");
            //as this shouldn't happen, we will make them log in again, to force the page to reload.
            //This should fix the issue, as it would be created by the user running their own code on the site.
            return resolve("{\"error\": true, \"message\": \"Please log in (3FCBD)\"}")
        }
        //resolve the defaults back to the parent function
        //TODO: load data into the defaults, and return custom data.
        resolve(defaults);
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
            resolve(JSON.parse(body));
        });
    })
}