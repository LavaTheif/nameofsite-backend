exports.invalid = async function(msg){
    return new Promise(async function (resolve) {
        resolve(await require('./handlers/invalid.json').eval({}, {reason_for_invalid_bcb3: msg}));
    });
};
