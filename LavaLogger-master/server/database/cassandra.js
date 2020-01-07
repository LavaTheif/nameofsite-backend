const cassandra = require('cassandra-driver');
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
    let time = new Date().getTime();//long
    if(!trace) trace = "";

    var PlainTextAuthProvider = cassandra.auth.PlainTextAuthProvider;
    var client = new cassandra.Client({ contactPoints:[config.ip+':'+config.port], localDataCenter: 'datacenter1',
        authProvider: new PlainTextAuthProvider(config.username, config.password)});

    let query = `INSERT INTO ${config.schema}.logs(timestamp, level, message, data, app, id, trace) VALUES(?, ?, ?, ?, ?, ?, ?);`;
    await client.execute(query, [time, level, message, data, app, id, trace], { prepare : true }).catch(e=>console.log(e));
    client.shutdown();
}

exports.create = async function(config){
    if(!config) {
        const fs = require('fs');
        let rawdata = fs.readFileSync('../config.json');
        config = JSON.parse(rawdata);
    }

    let keyspace = `CREATE KEYSPACE IF NOT EXISTS ${config.schema}
    WITH REPLICATION = {
        'class' : 'SimpleStrategy',
        'replication_factor' : 1
    };`

    let table = `CREATE TABLE IF NOT EXISTS ${config.schema}.logs(timestamp BIGINT, level INT, message VARCHAR, data VARCHAR, app VARCHAR, id VARCHAR, trace VARCHAR, PRIMARY KEY ((level), timestamp, app, id));`;

    var PlainTextAuthProvider = cassandra.auth.PlainTextAuthProvider;
    var client = new cassandra.Client({ contactPoints:[config.ip+':'+config.port], localDataCenter: 'datacenter1',
        authProvider: new PlainTextAuthProvider('cassandra', 'cassandra')});

    await client.execute(keyspace);
    await client.execute(table);
    client.shutdown();

}

exports.query = async function(options, config){
    var PlainTextAuthProvider = cassandra.auth.PlainTextAuthProvider;
    var client = new cassandra.Client({ contactPoints:[config.ip+':'+config.port], localDataCenter: 'datacenter1',
        authProvider: new PlainTextAuthProvider('cassandra', 'cassandra')});
    let safe = [options.level];

    let query = `SELECT * FROM ${config.schema}.logs WHERE level=? `;
    if(options.max){
        query += "AND timestamp<? ";
        safe.push(options.max);
    }
    if(options.min){
        query += "AND timestamp>? ";
        safe.push(options.min)
    }
    query += "ORDER BY timestamp "+(options.order==="DESC"?"DESC":"ASC")+" LIMIT ?;";
    // safe.push(options.order);
    safe.push(options.limit);

    let dat = await client.execute(query, safe, { prepare : true });
    client.shutdown();

    let list = [];
    for(let i in dat.rows){
        let row = dat.rows[i];

        //Checking app and ID throws an error if done in the query
        if(options.app){
            if(row.app !== options.app)
                continue;
        }
        if(options.id){
            if(row.id !== options.id)
                continue;
        }
        list.push({timestamp: row.timestamp-0, level: row.level, message: row.message, data: row.data, app: row.app, id: row.id, trace: row.trace})
    }

    return list;
}