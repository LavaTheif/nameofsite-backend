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

        //Checks if the user is in the board and gets their permission level (if applicable)
        let level = await utils.getPermissionLevel(user_id, board_id);
        if(level == null){
            //The user was not in a board or otherwise lacked permissions for this action (if applicable)
            return resolve(utils.noBoardError());
        }

        if(level.admin_level <= 1){
            //users permission level is too low.
            return utils.noPermError();
        }

        //Generate a new category id and insert it into the db.
        let boardClient = db_manager.getBoardConnectionWrite();
        let epoch = 1569799548533;
        let task_id = new Date().getTime()-epoch;
        await boardClient.execute("INSERT INTO board_data.tasks(board_id, task_id, title, details, is_top, status, root_node_id) VALUES(?,?,?,?,?,?,?);",
            [board_id,task_id, "unnamed category", "-", true, 0, task_id], { prepare : true }).catch(e=>console.log(e));

        //Close Connection
        db_manager.close(boardClient);

        //return results to client.
        returnDat.id = board_id;
        returnDat.task_id = task_id;
        returnDat.success = true;
        resolve(returnDat);
    })
}
