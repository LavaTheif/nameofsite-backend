// let defaults = require('../presets/userBoards.json');
let db_manager = require('../db_manager/manager');

exports.eval = async function(headers, post){
    return new Promise(async function(resolve) {
        let returnDat = {success: true};

        let user_id = 0;
        let board = genBoardID();

        let accClient = db_manager.getAccConnectionWrite();
        let boardClient = db_manager.getBoardConnectionWrite();

        await accClient.execute("INSERT INTO account_data.user_boards(user_id, board_id, admin_level) VALUES(?,?,?);", [user_id, board, 4],
            { prepare : true }).catch(e=>console.log(e));
        await boardClient.execute("INSERT INTO board_data.board_data(board_id, owner_id, name, description) VALUES(?,?,?,?);",
            [board,user_id, "unnamed", "-"], { prepare : true }).catch(e=>console.log(e));

        db_manager.close(accClient);
        db_manager.close(boardClient);
        returnDat.id = board;
        resolve(returnDat);
    })
}

function genBoardID(){
    let s = "";
    for(let i = 0; i < 8; i++)
        s+=(Math.random()*0xF<<0).toString(16);
    return s;
}