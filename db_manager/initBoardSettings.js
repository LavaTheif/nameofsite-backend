exports.init = function(config){
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/'+config.schema, {useNewUrlParser: true});
    var db = mongoose.connection;
    return new Promise((resolve) => {
        db.on('open', function () {
            var schema = new mongoose.Schema({
                bid: String,
                users: typeof [],
            });
            let db = mongoose.model('board-settings', schema);
            resolve(db);
        });
    });
}