exports.exec = function(config){
    var mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost/'+config.schema, {useNewUrlParser: true});
    var db = mongoose.connection;
    return new Promise((resolve) => {
        db.on('open', function () {
            var schema = new mongoose.Schema({
                date: Number,
                level: Number,
                message: String,
                data: String,
                app: String,
                id: String,
                trace: String,
                timestamp: Number,
            });
            let logs = mongoose.model('Logs', schema);
            config.logs = logs;
            resolve(config);
        });
    });
}