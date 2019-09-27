let defaults = require('./presets/invalid.json');

exports.eval = async function(headers, post){
    return new Promise(async function (resolve) {
        let returnDat = defaults;
        let reason = post.reason_for_invalid_bcb3;

        if(!reason)
            reason = "Unknown Error";

        returnDat.message = "Please log in ("+reason+")";

        resolve(JSON.stringify(returnDat));
    })
}