// let defaults = require('./presets/invalid.json');

exports.eval = async function(headers, post){
    return new Promise(async function (resolve) {
        let returnDat = {
            "error": true,
            // "message": "Please log in. (Unknown error)"
        };

        // let returnDat = {id: board_id};//defaults;
        if(!post){
            returnDat.success = false;
            returnDat.msg = "no. (002)";
            returnDat.close = true;
            return resolve(returnDat);
        }
        let reason = post.reason_for_invalid_bcb3;

        if(!reason)
            reason = "Unknown Error";

        returnDat.message = "Please log in ("+reason+")";

        resolve(JSON.stringify(returnDat));
    })
}