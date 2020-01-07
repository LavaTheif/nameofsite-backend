var mongoose = require('mongoose');
/*

 */
exports.save = async function(json, config){
    let level = json.level;//int (PK)
    let message = json.message+"";//String
    let data = JSON.stringify(json.data);//String
    let callback = json.callback;
    let app = callback.app+"";//String
    let id = callback.id+"";//String
    let trace = callback.trace+"";//String
    let timestamp = new Date().getTime();//long
    if(!trace) trace = "";

    /*mongoose.connect('mongodb://localhost/test', {useNewUrlParser: true});
    var db = mongoose.connection;

    db.once('open', function(){
    	var schema = new mongoose.Schema({
		level: Number,
		message: String,
		data: String,
		app:String,
		id:String,
		trace:String
	});*/
	//var logs = mongoose.model('logs', schema);

	if(!config.logs){
	    config = await require('./init_mongo.js').exec(config);
    }
    var Logs = config.logs;

	var entry = new Logs({timestamp: timestamp, level: level, message: message, data: data, app: app, id: id, trace: trace});
	entry.save().then(function (){
	
	// Logs.find(function (e, d){console.log(e, d)});
    })
}

exports.create = function(config){
    
}

exports.query = async function(options, config) {
    //TODO return an array in this form:
    //        list.push({timestamp: row.timestamp-0, level: row.level, message: row.message, data: row.data, app: row.app, id: row.id, trace: row.trace})

    if(!config.logs){
        config = await require('./init_mongo.js').exec(config);
    }
    if(!options.max){
        options.max = new Date().getTime()+1000;
    }
    var Logs = config.logs;
    let where_data = {};
    if(options.app){
        where_data['app']=options.app;
    }
    if(options.id){
        where_data['id']=options.id;
    }
    // return new Promise((resolve) => {
    let dat = Logs.find({level: Number(options.level)}).
        where('timestamp').gt(options.min).lt(options.max).
        where(where_data).
        limit(Number(options.limit)).
        sort((config.order==="ASC"?"":"-")+'timestamp')//TODO
    // })
    // console.log(dat);
    //
    return dat;

    // Logs.close();//TODO remove
};
