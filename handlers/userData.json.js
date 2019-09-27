let defaults = require('../presets/userData.json');

exports.eval = async function(headers, post){
    return new Promise(async function (resolve) {
        let returnDat = defaults;

        resolve(returnDat);
    })
}