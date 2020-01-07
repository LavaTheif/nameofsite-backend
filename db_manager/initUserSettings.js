exports.init = function(config){
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/'+config.schema, {useNewUrlParser: true});
    var db = mongoose.connection;
    return new Promise((resolve) => {
        db.on('open', function () {
            var schema = new mongoose.Schema({
                uid: String,
                email: String,
            });
            let db = mongoose.model('user-settings', schema);
            config.userSettings = db;
            resolve(config);
        });
    });
}