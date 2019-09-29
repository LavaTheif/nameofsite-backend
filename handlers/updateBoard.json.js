// let defaults = require('../presets/userBoards.json');
let db_manager = require('../db_manager/manager');

exports.eval = async function(headers, post){
    return new Promise(async function(resolve) {
        let returnDat = {success: true};

        let user_id = 0;
        let board_id = post.board_id || "invalid-board";

        //check user is in board, with relevant perms
        //TODO: sanitize data
        //TODO: update values in database
        //TODO: send updated info to all clients???? IFSDJIS

        let accClient = db_manager.getAccConnectionWrite();
        let boardClient = db_manager.getBoardConnectionWrite();

        let level = await accClient.execute("SELECT admin_level FROM account_data.user_boards WHERE user_id=? AND board_id=?;", [user_id, board_id],
            { prepare : true }).catch(e=>console.log(e));
        let isInBoard = !!level.rows[0];

        if(!isInBoard || level.rows[0].admin_level <= 2){
            returnDat.msg = "Board not found or you are missing permissions for this action.";
            returnDat.success = false;
            return resolve(returnDat);
        }

        let name = post.board_name || "unnamed";
        let desc = post.board_desc || "-";

        if(name.length > 25){
            returnDat.msg = "Max length: 25 characters.";
            returnDat.success = false;
            return resolve(returnDat);
        }
        if(desc.length > 252){
            returnDat.msg = "Max length: 252 characters.";
            returnDat.success = false;
            return resolve(returnDat);
        }
        await boardClient.execute("INSERT INTO board_data.board_data(board_id, name, description) VALUES(?,?,?);",
            [board_id, name, desc], { prepare : true }).catch(e=>console.log(e));

        db_manager.close(accClient);
        db_manager.close(boardClient);
        returnDat.id = board_id;
        returnDat.board_name = name;
        returnDat.board_desc = desc;
        resolve(returnDat);
    })
}
