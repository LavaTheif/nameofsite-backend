let db_manager = require('../db_manager/manager');
let utils = require('../commons');

exports.eval = async function(headers, post){
    return new Promise(async function(resolve) {

        //Return data
        let returnDat = {};
        //Get the board id & user ID
        let board_id = genBoardID();
        let user_id = post.uid;

        //Get Database connections and insert relevant data into them..
        let accClient = db_manager.getAccConnectionWrite();
        let boardClient = db_manager.getBoardConnectionWrite();

        await accClient.execute("INSERT INTO account_data.user_boards(user_id, board_id, admin_level) VALUES(?,?,?);", [user_id, board_id, 4],
            { prepare : true }).catch(e=>console.log(e));
        await boardClient.execute("INSERT INTO board_data.board_data(board_id, owner_id, name, description) VALUES(?,?,?,?);",
            [board_id,user_id, "unnamed", "-"], { prepare : true }).catch(e=>console.log(e));

        db_manager.close(accClient);
        db_manager.close(boardClient);
        returnDat.id = board_id;
        resolve(returnDat);
    })
}

function genBoardID(){
    let s = "";
    for(let i = 0; i < 8; i++)
        s+=(Math.random()*0xF<<0).toString(16);
    return s;
}