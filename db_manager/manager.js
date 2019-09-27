const cassandra = require('cassandra-driver');
let ip = "192.168.0.15";
let port = 9042;

//TODO: Create an account with only read or write access to only board or account data

exports.getBoardConnectionRead = function(){
    var PlainTextAuthProvider = cassandra.auth.PlainTextAuthProvider;
    var client = new cassandra.Client({ contactPoints:[ip+":"+port], localDataCenter: 'datacenter1',
        authProvider: new PlainTextAuthProvider("cassandra","cassandra")});
    return client;
}

exports.getBoardConnectionWrite = function(){
    var PlainTextAuthProvider = cassandra.auth.PlainTextAuthProvider;
    var client = new cassandra.Client({ contactPoints:[ip+":"+port], localDataCenter: 'datacenter1',
        authProvider: new PlainTextAuthProvider("cassandra","cassandra")});
    return client;
}

exports.getAccConnectionRead = function(){
    var PlainTextAuthProvider = cassandra.auth.PlainTextAuthProvider;
    var client = new cassandra.Client({ contactPoints:[ip+":"+port], localDataCenter: 'datacenter1',
        authProvider: new PlainTextAuthProvider("cassandra","cassandra")});
    return client;
}
exports.getAccConnectionWrite = function(){
    var PlainTextAuthProvider = cassandra.auth.PlainTextAuthProvider;
    var client = new cassandra.Client({ contactPoints:[ip+":"+port], localDataCenter: 'datacenter1',
        authProvider: new PlainTextAuthProvider("cassandra","cassandra")});
    return client;
}

exports.close = function(client){
    client.shutdown();
}