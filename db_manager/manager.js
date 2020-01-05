const cassandra = require('cassandra-driver');
//TODO: Load from seperate file
let ip = "localhost";
let port = 9042;

//TODO: Create an account with only read or write access to only board or account data

/*
      user_id: '6c78c51a-3b75-4101-9b18-632dfb06dc78',
      board_id: 'eaaa5e12',
      admin_level: 4
 */

exports.generate = async function(){
    var PlainTextAuthProvider = cassandra.auth.PlainTextAuthProvider;
    var client = new cassandra.Client({ contactPoints:[ip+":"+port], localDataCenter: 'datacenter1',
        authProvider: new PlainTextAuthProvider("cassandra","cassandra")});
    let data =
        // 'CREATE TABLE account_data.accounts(id VARCHAR PRIMARY KEY, username VARCHAR, last_login BIGINT, signed_up BIGINT, pwd VARCHAR);'
        // 'CREATE TABLE account_data.user_lookup(username VARCHAR PRIMARY KEY, id VARCHAR);'
        'CREATE TABLE account_data.user_boards(user_id VARCHAR, board_id VARCHAR, admin_level INT, PRIMARY KEY ((user_id), board_id));';
        //     'CREATE TABLE board_data.tasks(task_id BIGINT, board_id VARCHAR, title VARCHAR, details VARCHAR, due_date BIGINT, status INT, parent_id BIGINT, root_node_id BIGINT, is_top BOOLEAN, PRIMARY KEY (board_id, is_top, root_node_id, task_id));'
        // 'CREATE TABLE board_data.board_data(board_id VARCHAR PRIMARY KEY, owner_id VARCHAR, name VARCHAR, description VARCHAR);'
        // 'CREATE TABLE board_data.comments(comment_id BIGINT, task_id BIGINT, user_id VARCHAR, content VARCHAR, timestamp BIGINT, PRIMARY KEY ((task_id), comment_id));'

            // client.execute("DROP TABLE board_data.tasks;")
            await client.execute("DROP TABLE account_data.user_boards;")
    await client.execute(data);
    await client.execute("INSERT INTO account_data.user_boards(user_id, board_id, admin_level) VALUES('6c78c51a-3b75-4101-9b18-632dfb06dc78','eaaa5e12',4);");
    console.log(await client.execute("SELECT board_id FROM account_data.user_boards WHERE user_id='6c78c51a-3b75-4101-9b18-632dfb06dc78';"));
    console.log(await client.execute("SELECT user_id FROM account_data.user_boards WHERE board_id='eaaa5e12';"));
}

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