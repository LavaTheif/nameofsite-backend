let utils = require('../commons');
let db_manager = require('../db_manager/manager');

exports.eval = async function(headers, post){
    return new Promise(async function(resolve) {
        //Return data
        let returnDat = {};
        //Get the board id & user ID
        let board_id = post.board_id || "invalid-board";
        let user_id = post.uid;

        //Check it matches the ReGex for a correct board ID
        if(!utils.isValidBoardID(board_id)){
            return resolve(utils.noBoardError());
        }


        //check user is in board, with relevant perms
        //sanitize data
        //update values in database
        //TODO: send updated info to all clients???? IFSDJIS

        //Checks if the user is in the board and gets their permission level (if applicable)
        let level = await utils.getPermissionLevel(user_id, board_id);
        if(level == null){
            //The user was not in a board or otherwise lacked permissions
            //for this action (if applicable)
            return resolve(utils.noBoardError());
        }

        if(level.admin_level <= 2){
            //users permission level is too low.
            return utils.noPermError();
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

        let boardClient = db_manager.getBoardConnectionWrite();
        await boardClient.execute("UPDATE board_data.board_data SET name=?, description=? WHERE board_id=?;",
            [name, desc, board_id], { prepare : true }).catch(e=>console.log(e));

        db_manager.close(boardClient);
        returnDat.id = board_id;
        returnDat.board_name = name;
        returnDat.board_desc = desc;
        resolve(returnDat);
    })
}
